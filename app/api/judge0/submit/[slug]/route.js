import { isDeepStrictEqual } from "node:util";
import connectDB from "@/lib/mongoose";
import Problem from "@/models/problems";
import Submission from "@/models/submission";
import User from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";
import { recordFirstSolve } from "@/lib/progress";
import { findLobbyForSubmission, applyLobbyScore } from "@/lib/playground";

export const maxDuration = 60;

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

const LANGUAGE_IDS = { javascript: 63, python: 71, java: 62, cpp: 53 };
const MAX_CODE_LENGTH = 64 * 1024;
const BATCH_SIZE = 20; // Judge0's default max submissions per batch
const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 60;
const MAX_TEXT = 2000;

// Per-submission limits above these make Judge0 reject the submission.
// Values are Judge0's defaults; if you changed MAX_* in judge0.conf, set the
// matching env vars below.
const CAPS = {
  cpuSeconds: Number(process.env.JUDGE0_MAX_CPU_TIME_LIMIT) || 15,
  wallSeconds: Number(process.env.JUDGE0_MAX_WALL_TIME_LIMIT) || 20,
  memoryKb: Number(process.env.JUDGE0_MAX_MEMORY_LIMIT) || 512000,
  fileKb: Number(process.env.JUDGE0_MAX_MAX_FILE_SIZE) || 4096,
};

const STATUS_BY_VERDICT = {
  Accepted: "accepted",
  "Wrong Answer": "wrong_answer",
  "Compilation Error": "compilation_error",
  "Runtime Error": "runtime_error",
  "Time Limit Exceeded": "time_limit_exceeded",
  "Memory Limit Exceeded": "memory_limit_exceeded",
  "Internal Error": "internal_error",
};

// Errors whose message is safe and useful to show to the client.
class JudgeError extends Error {}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const toB64 = (s) => Buffer.from(String(s ?? ""), "utf8").toString("base64");
const fromB64 = (s) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

/* ------------------------------ input / output ------------------------------ */

// Same stdin formats the frontend used before (moved to the server).
function formatStdin(language, inputs) {
  if (language === "python" || language === "javascript") {
    return JSON.stringify(inputs);
  }
  const flatten = (value) => {
    if (Array.isArray(value)) return value.map(flatten).join(" ");
    if (typeof value === "object" && value !== null) return Object.values(value).map(flatten).join(" ");
    return String(value);
  };
  return Object.values(inputs).map(flatten).join(" ");
}

// Function replacer so "$&" etc. inside user code is never interpreted.
function wrapCode(language, userCode, languageWrappers) {
  const wrapper = languageWrappers?.[language];
  if (!wrapper) return userCode;
  return wrapper.replace("{code}", () => userCode);
}

function expectedToString(expected) {
  if (typeof expected === "string") return expected;
  if (expected !== null && typeof expected === "object") return JSON.stringify(expected);
  return String(expected);
}

const cleanLines = (s) =>
  s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trim();

function outputsMatch(actual, expected, mode) {
  const expectedStr = expectedToString(expected);

  if (mode === "exact") return actual === expectedStr;

  if (mode === "json") {
    try {
      const parsedActual = JSON.parse(actual);
      // expectedOutput is stored as a real value (9, "olleh", [1,2]), so compare directly
      if (isDeepStrictEqual(parsedActual, expected)) return true;
      // also accept expected stored as JSON text, e.g. '"olleh"' or '[1,2]'
      if (typeof expected === "string") {
        try {
          if (isDeepStrictEqual(parsedActual, JSON.parse(expected))) return true;
        } catch {}
      }
    } catch {
      // output isn't JSON (e.g. Java/C++ print raw text) – fall through
    }
  }

  return cleanLines(actual) === cleanLines(expectedStr);
}

/* --------------------------------- Judge0 --------------------------------- */

async function judge0(path, options = {}) {
  const res = await fetch(`${JUDGE0_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new JudgeError(`Judge0 responded with ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function runBatch(payloads) {
  const created = await judge0("/submissions/batch?base64_encoded=true", {
    method: "POST",
    body: JSON.stringify({ submissions: payloads }),
  });
  if (!Array.isArray(created)) {
    throw new JudgeError(`Judge0 returned an unexpected response: ${JSON.stringify(created).slice(0, 300)}`);
  }
  const rejected = created
    .map((c, i) => (c?.token ? null : `test #${i + 1}: ${JSON.stringify(c)}`))
    .filter(Boolean);
  if (rejected.length) {
    console.error("Judge0 rejected submissions:", rejected);
    throw new JudgeError(`Judge0 rejected ${rejected.length} submission(s) — ${rejected[0]}`);
  }
  const tokens = created.map((c) => c.token);

  // fields=* returns the full submission (including the `status` object);
  // a custom field list can silently omit it and make polling spin forever.
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const data = await judge0(
      `/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true&fields=*`
    );
    const byToken = new Map(data.submissions.map((s) => [s.token, s]));
    const ordered = tokens.map((t) => byToken.get(t));
    if (ordered.every((s) => s && (s.status?.id ?? s.status_id) > 2)) return ordered;
    await sleep(POLL_INTERVAL_MS);
  }
  throw new JudgeError("Judge0 timed out");
}

/* -------------------------------- verdicts -------------------------------- */

function evaluate(sub, testCase, limits, comparison) {
  const statusId = sub.status?.id ?? sub.status_id;
  const timeMs = sub.time != null ? Math.round(parseFloat(sub.time) * 1000) : null;
  const memoryKb = sub.memory ?? null;
  const base = { timeMs, memoryKb };

  const stdout = fromB64(sub.stdout);
  const stderr = fromB64(sub.stderr);
  const compileOutput = fromB64(sub.compile_output);

  if (statusId === 6) {
    return { ...base, verdict: "Compilation Error", message: compileOutput.slice(0, MAX_TEXT) };
  }
  if (statusId === 5) {
    return { ...base, verdict: "Time Limit Exceeded" };
  }
  if (statusId >= 7 && statusId <= 12) {
    // Judge0 has no dedicated "memory limit" status: it kills the process, so
    // we treat a runtime error that used (almost) all the memory as MLE.
    const hitMemoryLimit = memoryKb != null && memoryKb >= limits.memoryLimitMb * 1024 * 0.95;
    return {
      ...base,
      verdict: hitMemoryLimit ? "Memory Limit Exceeded" : "Runtime Error",
      message: stderr.slice(0, MAX_TEXT),
    };
  }
  if (statusId !== 3) {
    return { ...base, verdict: "Internal Error", message: sub.status?.description ?? "Judge error" };
  }

  const ok = outputsMatch(stdout, testCase.expectedOutput, comparison);
  return {
    ...base,
    verdict: ok ? "Accepted" : "Wrong Answer",
    actual: stdout.trim().slice(0, MAX_TEXT),
  };
}

/* ---------------------------------- route ---------------------------------- */

export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const { code, language, mode } = body;

    if (mode !== "run" && mode !== "submit") return json({ message: "Invalid mode" }, 400);
    if (!LANGUAGE_IDS[language]) return json({ message: "Unsupported language" }, 400);
    if (typeof code !== "string" || !code.trim()) return json({ message: "Code is empty" }, 400);
    if (code.length > MAX_CODE_LENGTH) return json({ message: "Code is too long" }, 413);

    // Submitting needs a logged-in user. (Run stays open for now – add auth /
    // rate-limiting here too before going to production.)
    let userId = null;
    if (mode === "submit") {
         const { user, error } = await authUser(req);
          if (error) return error;
          if (!user) return json({ message: "Please log in to see your submissions." }, 401);
          userId = user._id;
    }

    await connectDB();

    const problem = await Problem.findOne({
      slug: String(slug).toLowerCase(),
      visibility: "published",
    }).lean();
    if (!problem) return json({ message: "Problem not found" }, 404);

    if (mode === "submit") {
      const account = await User.findOne({ _id: userId, accountStatus: "active" }).select("_id").lean();
      if (!account) return json({ message: "Your account can't submit right now." }, 403);
    }

    // ---- server-side test case selection (never trust the client) ----
    const all = (problem.testCases ?? []).map((tc, index) => ({ tc, index }));
    const selected = mode === "run" ? all.filter(({ tc }) => tc.isHidden === false) : all;

    if (selected.length === 0) {
      return json(
        { message: mode === "run" ? "This problem has no example test cases yet." : "This problem has no test cases yet." },
        422
      );
    }

    const limits = {
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      maxOutputSizeKb: 1024,
      wallTimeLimitMs: 5000,
      ...(problem.limits ?? {}),
    };
    const comparison = problem.outputComparison ?? "trimmed";
    const wrappedCode = wrapCode(language, code, problem.languageWrappers);

    // Clamp to what Judge0 accepts; wall time must not be below cpu time.
    const cpuSeconds = Math.min(Number(limits.timeLimitMs) / 1000, CAPS.cpuSeconds);
    const wallSeconds = Math.min(Math.max(Number(limits.wallTimeLimitMs) / 1000, cpuSeconds), CAPS.wallSeconds);
    const memoryKb = Math.min(Math.round(Number(limits.memoryLimitMb) * 1024), CAPS.memoryKb);
    const fileKb = Math.min(Math.round(Number(limits.maxOutputSizeKb)), CAPS.fileKb);

    const payloads = selected.map(({ tc }) => ({
      source_code: toB64(wrappedCode),
      language_id: LANGUAGE_IDS[language],
      stdin: toB64(formatStdin(language, tc.inputs)),
      cpu_time_limit: cpuSeconds,
      wall_time_limit: wallSeconds,
      memory_limit: memoryKb,
      max_file_size: fileKb,
    }));

    const startedAt = new Date();
    const subs = [];
    for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
      subs.push(...(await runBatch(payloads.slice(i, i + BATCH_SIZE))));
    }

    const evals = selected.map(({ tc, index }, i) => ({
      index,
      hidden: tc.isHidden !== false,
      tc,
      ...evaluate(subs[i], tc, limits, comparison),
    }));

    const firstFailure = evals.find((e) => e.verdict !== "Accepted") ?? null;
    const times = evals.map((e) => e.timeMs).filter((v) => v != null);
    const mems = evals.map((e) => e.memoryKb).filter((v) => v != null);

    const summary = {
      mode,
      verdict: firstFailure ? firstFailure.verdict : "Accepted",
      passed: evals.filter((e) => e.verdict === "Accepted").length,
      total: evals.length,
      timeMs: times.length ? Math.max(...times) : null,
      memoryKb: mems.length ? Math.max(...mems) : null,
      compileOutput: firstFailure?.verdict === "Compilation Error" ? firstFailure.message : null,
    };

    if (mode === "run") {
      // Only public cases were selected, so inputs / expected are safe to return.
      return json({
        ...summary,
        cases: evals.map((e, i) => ({
          number: i + 1,
          verdict: e.verdict,
          timeMs: e.timeMs,
          memoryKb: e.memoryKb,
          inputs: e.tc.inputs,
          expected: expectedToString(e.tc.expectedOutput),
          actual: e.actual ?? null,
          message: e.verdict === "Compilation Error" ? null : e.message ?? null,
        })),
      });
    }

    /* ----------------------------- submit mode ----------------------------- */

    // reveal details only when the failing case is public.
    const failedCase = firstFailure
      ? {
          number: firstFailure.index + 1,
          hidden: firstFailure.hidden,
          verdict: firstFailure.verdict,
          ...(firstFailure.hidden
            ? {}
            : {
                inputs: firstFailure.tc.inputs,
                expected: expectedToString(firstFailure.tc.expectedOutput),
                actual: firstFailure.actual ?? null,
                message: firstFailure.verdict === "Compilation Error" ? null : firstFailure.message ?? null,
              }),
        }
      : null;

    const accepted = summary.verdict === "Accepted";

    // stderr of a hidden case could hint at its data, so only keep it for
    // compile errors and public cases.
    const errorMessage = !firstFailure
      ? null
      : firstFailure.verdict === "Compilation Error"
      ? firstFailure.message
      : firstFailure.hidden
      ? null
      : firstFailure.message ?? null;


    if(accepted){
      await User.updateOne(
        {
          _id: userId,
          solvedProblems: { $ne: problem._id },
          'solvedHistory.problem': { $ne: problem._id },
        },
        {
          $push: { solvedHistory: { problem: problem._id, solvedAt: new Date() } },
        }
      );
    }

    // Only attach the submission to a lobby the user really plays in (never trust body.lobby).
    const lobbyDoc = await findLobbyForSubmission({ lobbyId: body.lobby, userId, problemId: problem._id });


    // a lobby that has ended takes no more submissions
    if (body.lobby && lobbyDoc && (lobbyDoc.status !== "active" || new Date(lobbyDoc.endsAt) <= new Date())) {
      return json({ message: "This party has ended. Go back to the party to see the results." }, 409);
    }

    const submission = await Submission.create({
      user: userId,
      problem: problem._id,
      playground: lobbyDoc?._id ?? null,
      code,
      language,
      status: STATUS_BY_VERDICT[summary.verdict] ?? "internal_error",
      execution: {
        timeMs: summary.timeMs,
        memoryKb: summary.memoryKb,
        passedTests: summary.passed,
        totalTests: summary.total,
      },
      failedCase: failedCase
        ? {
            number: failedCase.number,
            hidden: failedCase.hidden,
            verdict: failedCase.verdict,
            inputs: failedCase.inputs,
            expected: failedCase.expected,
            actual: failedCase.actual,
          }
        : null,
      scoreAwarded: evals.filter((e) => e.verdict === "Accepted").reduce((sum, e) => sum + (e.tc.points ?? 1), 0),
      errorMessage,
      submittedAt: startedAt,
      judgedAt: new Date(),
    });

    // Bookkeeping must never hide a finished judgement from the user.
    let progress = null;
    try {
      await Problem.updateOne(
        { _id: problem._id },
        { $inc: { "stats.submissionCount": 1, "stats.acceptedCount": accepted ? 1 : 0 } }
      );
      if (accepted) progress = await recordFirstSolve({ userId, problem });
    } catch (error) {
      console.error("Progress update failed:", error);
    }

    // Multiplayer scoring (counted once per player per problem, only while the game is running).
    let lobby = null;
    try {
      lobby = await applyLobbyScore({ lobby: lobbyDoc, userId, problem, submission, accepted });
    } catch (error) {
      console.error("Lobby score failed:", error);
    }

    return json({
      ...summary,
      failedCase,
      lobby,
      submissionId: String(submission._id),
      submittedAt: submission.submittedAt,
      firstSolve: progress?.firstSolve ?? false,
      streak: progress?.streak ?? null,
    });
  } catch (error) {
    console.error("Judge error:", error);
    if (error instanceof JudgeError) return json({ message: error.message }, 502);
    return json({ message: "The judge is unavailable right now. Please try again." }, 502);
  }
}