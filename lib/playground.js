import { randomInt } from "node:crypto";
import mongoose from "mongoose";
import Playground from "@/models/playground";
import Submission from "@/models/submission";
import { emit, lobbyRoom } from "@/lib/realtime";

export const MIN_PLAYERS_TO_START = Number(process.env.PLAYGROUND_MIN_PLAYERS) || 2;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

const idOf = (value) => String(value?._id ?? value);

// An invite that nobody answers expires after this long (default 2 minutes).

export const INVITE_TTL_MS = (Number(process.env.PLAYGROUND_INVITE_TTL_SECONDS) || 120) * 1000;
export const inviteExpiresAt = (member) => new Date(new Date(member.invitedAt ?? 0).getTime() + INVITE_TTL_MS);
export const isInviteExpired = (member, now = Date.now()) =>
  member.status === "invited" && inviteExpiresAt(member).getTime() <= now;
// what the status really is right now: an old unanswered invite counts as "expired"
export const effectiveStatus = (member, now = Date.now()) => (isInviteExpired(member, now) ? "expired" : member.status);

/* ------------------------------- ranking ------------------------------- */

const time = (d) => (d ? new Date(d).getTime() : Infinity);

// higher score first; tie -> whoever solved last problem earlier; then who joined first
export function compareMembers(a, b) {
  return (
    (b.totalScore ?? 0) - (a.totalScore ?? 0) ||
    time(a.lastSolvedAt) - time(b.lastSolvedAt) ||
    time(a.joinedAt) - time(b.joinedAt)
  );
}

export function rankMembers(members) {
  return members
    .filter((m) => m.status === "joined")
    .sort(compareMembers)
    .map((m, i) => ({ ...m, rank: i + 1 }));
}

/* --------------------------- finishing a game --------------------------- */

// Idempotent: only the first caller that finds the game "active" completes it.
export async function completePlayground(id) {
  const pg = await Playground.findOne({ _id: id, status: "active" }).lean();
  if (!pg) return Playground.findById(id).lean();

  const ranked = rankMembers(pg.members);
  const results = ranked.map((m) => ({
    user: m.user,
    rank: m.rank,
    score: m.totalScore ?? 0,
    solvedCount: m.solved?.length ?? 0,
    lastSolvedAt: m.lastSolvedAt ?? null,
  }));
  const winner = ranked.length && (ranked[0].totalScore ?? 0) > 0 ? ranked[0].user : null;

  const updated = await Playground.findOneAndUpdate(
    { _id: id, status: "active" },
    { $set: { status: "completed", endedAt: new Date(), results, winner } },
    { new: true }
  ).lean();

  if (updated) emit(lobbyRoom(id), "game:ended", { id: String(id) });
  return updated ?? Playground.findById(id).lean();
}

// Lazy check used by read endpoints: if time is up, finish the game now.
export async function completeIfDue(pg) {
  if (pg?.status === "active" && pg.endsAt && new Date(pg.endsAt) <= new Date()) {
    return completePlayground(pg._id);
  }
  return pg;
}

/* ------------------------- scoring from the judge ------------------------- */

// The lobby this submission belongs to (user joined + problem is part of it), else null.
export async function findLobbyForSubmission({ lobbyId, userId, problemId }) {
  if (!lobbyId || !mongoose.isValidObjectId(lobbyId)) return null;
  return Playground.findOne({
    _id: lobbyId,
    status: { $in: ["active", "completed"] },
    members: { $elemMatch: { user: userId, status: "joined" } },
    "problems.problem": problemId,
  })
    .select("status endsAt settings problems")
    .lean();
}

/**
 * Adds points for an accepted submission. Counted once per member per problem.
 *   score = max(50% of the points, points - wrongAttempts * penalty)
 * Compilation errors don't count as wrong attempts.
 */
export async function applyLobbyScore({ lobby, userId, problem, submission, accepted }) {
  if (!lobby || lobby.status !== "active" || new Date(lobby.endsAt) <= new Date()) {
    return { counted: false, reason: "match-not-active" };
  }
  if (!accepted) return { counted: false, reason: "not-accepted" };

  const entry = lobby.problems.find((p) => idOf(p.problem) === idOf(problem._id));
  if (!entry) return { counted: false, reason: "not-in-lobby" };

  const wrong = await Submission.countDocuments({
    playground: lobby._id,
    user: userId,
    problem: problem._id,
    status: { $nin: ["accepted", "compilation_error"] },
  });
  const penalty = lobby.settings?.wrongAttemptPenalty ?? 10;
  const score = Math.max(Math.round(entry.points * 0.5), entry.points - wrong * penalty);
  const now = new Date();

  // Atomic: only applies if the game is still running and this member hasn't solved the problem yet.
  const result = await Playground.updateOne(
    {
      _id: lobby._id,
      status: "active",
      endsAt: { $gt: now },
      members: { $elemMatch: { user: userId, status: "joined", "solved.problem": { $ne: problem._id } } },
    },
    {
      $inc: { "members.$.totalScore": score },
      $push: { "members.$.solved": { problem: problem._id, submission: submission._id, score, solvedAt: now } },
      $set: { "members.$.lastSolvedAt": now },
    }
  );
  if (result.modifiedCount !== 1) return { counted: false, reason: "already-solved" };

  await Submission.updateOne({ _id: submission._id }, { scoreAwarded: score });
  emit(lobbyRoom(lobby._id), "leaderboard:update", { userId: String(userId), problemId: String(problem._id) });

  // Everyone solved everything -> end early.
  const fresh = await Playground.findById(lobby._id).select("members problems").lean();
  const joined = fresh.members.filter((m) => m.status === "joined");
  if (joined.length && joined.every((m) => (m.solved?.length ?? 0) >= fresh.problems.length)) {
    await completePlayground(lobby._id);
  }

  const me = fresh.members.find((m) => idOf(m.user) === String(userId));
  return { counted: true, score, totalScore: me?.totalScore ?? score };
}

/* ------------------------- what the client sees ------------------------- */

// `pg` must have members.user (username), problems.problem and winner populated.
export function serializeState(pg, viewerId) {
  const me = pg.members.find((m) => idOf(m.user) === String(viewerId));
  const joined = me?.status === "joined";

  const usernameById = new Map(pg.members.map((m) => [idOf(m.user), m.user?.username ?? "Player"]));

  const members = pg.members
    .filter((m) => m.status === "joined" || effectiveStatus(m) === "invited")
    .map((m) => ({
      id: idOf(m.user),
      username: usernameById.get(idOf(m.user)),
      role: m.role,
      status: effectiveStatus(m),
      inviteExpiresAt: m.status === "invited" ? inviteExpiresAt(m).toISOString() : null,
      totalScore: m.totalScore ?? 0,
      solvedCount: m.solved?.length ?? 0,
    }));

  const leaderboard = rankMembers(pg.members).map((m) => ({
    rank: m.rank,
    id: idOf(m.user),
    username: usernameById.get(idOf(m.user)),
    score: m.totalScore ?? 0,
    solvedCount: m.solved?.length ?? 0,
  }));

  const solvedByMe = new Set((me?.solved ?? []).map((s) => idOf(s.problem)));
  const problems =
    joined && pg.status !== "waiting"
      ? [...pg.problems]
          .sort((a, b) => a.order - b.order)
          .map((p) => ({
            id: idOf(p.problem),
            title: p.problem?.title,
            slug: p.problem?.slug,
            difficulty: p.problem?.difficulty,
            points: p.points,
            solvedByMe: solvedByMe.has(idOf(p.problem)),
          }))
      : null;

  return {
    id: String(pg._id),
    title: pg.title,
    code: joined ? pg.code : null,
    status: pg.status,
    settings: {
      maxPlayers: pg.settings.maxPlayers,
      durationMinutes: pg.settings.durationMinutes,
      problemCount: pg.settings.problemCount,
      difficulty: pg.settings.difficulty,
    },
    startedAt: pg.startedAt,
    endsAt: pg.endsAt,
    endedAt: pg.endedAt,
    serverNow: new Date().toISOString(),
    minPlayersToStart: MIN_PLAYERS_TO_START,
    me: { status: me ? effectiveStatus(me) : undefined, role: me?.role },
    members,
    leaderboard,
    problems,
    results:
      pg.status === "completed"
        ? pg.results.map((r) => ({
            rank: r.rank,
            id: idOf(r.user),
            username: usernameById.get(idOf(r.user)),
            score: r.score,
            solvedCount: r.solvedCount,
          }))
        : null,
    winner: pg.winner ? { id: idOf(pg.winner), username: pg.winner.username } : null,
  };
}