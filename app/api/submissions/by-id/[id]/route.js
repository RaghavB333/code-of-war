import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Submission from "@/models/submission";
import { authUser } from "@/app/middlewares/auth.middleware";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const HISTOGRAM_BUCKETS = 30;
const HISTOGRAM_SAMPLE = 5000; // newest N accepted submissions are enough for a chart

function buildHistogram(values, mine) {
  if (!values.length) return null;
  const min = Math.min(...values, mine);
  const max = Math.max(...values, mine);
  const width = Math.max(1, Math.ceil((max - min + 1) / HISTOGRAM_BUCKETS));
  const count = Math.floor((max - min) / width) + 1;
  const buckets = Array.from({ length: count }, (_, i) => ({
    from: min + i * width,
    to: min + (i + 1) * width - 1,
    count: 0,
  }));
  for (const v of values) buckets[Math.floor((v - min) / width)].count += 1;
  return { buckets, mine: Math.floor((mine - min) / width) };
}

// GET /api/submissions/:id  (only the owner can open a submission)
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const { user, error } = await authUser(req);
    if (error) return error;
    if (!user) return json({ message: "Please log in." }, 401);
    if (!mongoose.isValidObjectId(id)) return json({ message: "Submission not found" }, 404);
    const userId = user._id;

    await connectDB();

    const submission = await Submission.findById(id)
      .populate("problem", "title slug difficulty")
      .populate("user", "username")
      .lean();

    // 404 (not 403) so other people's submission ids can't be probed.
    if (!submission || String(submission.user?._id) !== String(userId)) {
      return json({ message: "Submission not found" }, 404);
    }

    const { timeMs, memoryKb } = submission.execution ?? {};
    let beats = null;
    let runtimeDistribution = null;

    if (submission.status === "accepted" && timeMs != null) {
      // Compare with every accepted submission of the same problem + language.
      const base = {
        problem: submission.problem._id,
        language: submission.language,
        status: "accepted",
      };

      const [totalRuntime, slowerRuntime, totalMemory, higherMemory, sample] = await Promise.all([
        Submission.countDocuments({ ...base, "execution.timeMs": { $ne: null } }),
        Submission.countDocuments({ ...base, "execution.timeMs": { $gt: timeMs } }),
        Submission.countDocuments({ ...base, "execution.memoryKb": { $ne: null } }),
        Submission.countDocuments({ ...base, "execution.memoryKb": { $gt: memoryKb ?? 0 } }),
        Submission.find({ ...base, "execution.timeMs": { $ne: null } })
          .sort({ submittedAt: -1 })
          .limit(HISTOGRAM_SAMPLE)
          .select("execution.timeMs")
          .lean(),
      ]);

      beats = {
        runtime: totalRuntime ? Math.round((slowerRuntime / totalRuntime) * 10000) / 100 : null,
        memory: totalMemory && memoryKb != null ? Math.round((higherMemory / totalMemory) * 10000) / 100 : null,
      };
      runtimeDistribution = buildHistogram(
        sample.map((s) => s.execution.timeMs),
        timeMs
      );
    }

    return json({
      id: String(submission._id),
      status: submission.status,
      language: submission.language,
      code: submission.code,
      submittedAt: submission.submittedAt,
      judgedAt: submission.judgedAt,
      user: { username: submission.user?.username ?? "You" },
      problem: {
        title: submission.problem?.title,
        slug: submission.problem?.slug,
        difficulty: submission.problem?.difficulty,
      },
      execution: {
        timeMs: timeMs ?? null,
        memoryKb: memoryKb ?? null,
        passedTests: submission.execution?.passedTests ?? 0,
        totalTests: submission.execution?.totalTests ?? 0,
      },
      scoreAwarded: submission.scoreAwarded ?? 0,
      errorMessage: submission.errorMessage ?? null,
      failedCase: submission.failedCase ?? null,
      beats,
      runtimeDistribution,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return json({ message: "Internal server error" }, 500);
  }
}