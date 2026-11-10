import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { completeIfDue } from "@/lib/playground";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// GET /api/playgrounds/:id/result
// Full leaderboard of a FINISHED playground, for players who took part in it.
// (If the game isn't finished yet only { status } is returned and the page links to the lobby.)
export async function GET(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ message: "Playground not found" }, 404);

    await connectDB();

    // if the clock ran out, finish the game first so the results exist
    const head = await Playground.findById(id).select("status endsAt").lean();
    if (!head) return json({ message: "Playground not found" }, 404);
    await completeIfDue(head);

    const pg = await Playground.findById(id)
      .populate("members.user", "username")
      .populate("problems.problem", "title slug difficulty")
      .populate("owner", "username")
      .populate("winner", "username")
      .lean();

    const me = pg.members.find((m) => String(m.user?._id) === String(userId));
    // 404 (not 403) so ids can't be probed; only players of the game can see it
    if (!me || me.status !== "joined") return json({ message: "Playground not found" }, 404);

    const base = { id: String(pg._id), title: pg.title, status: pg.status };
    if (pg.status !== "completed") return json(base);

    const startedAt = pg.startedAt ? new Date(pg.startedAt).getTime() : null;
    const sinceStart = (date) => (startedAt && date ? Math.max(0, new Date(date).getTime() - startedAt) : null);

    const problems = [...pg.problems]
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        id: String(p.problem?._id),
        title: p.problem?.title ?? "Problem",
        slug: p.problem?.slug,
        difficulty: p.problem?.difficulty,
        points: p.points,
        solvedBy: 0,
      }));
    const problemById = new Map(problems.map((p) => [p.id, p]));
    const memberById = new Map(pg.members.map((m) => [String(m.user?._id), m]));

    const standings = [...pg.results]
      .sort((a, b) => a.rank - b.rank)
      .map((r) => {
        const member = memberById.get(String(r.user));
        const solved = (member?.solved ?? [])
          .map((s) => ({
            problemId: String(s.problem),
            score: s.score,
            solvedAt: s.solvedAt,
            timeMs: sinceStart(s.solvedAt),
          }))
          .sort((a, b) => new Date(a.solvedAt) - new Date(b.solvedAt));

        solved.forEach((s) => {
          const p = problemById.get(s.problemId);
          if (p) p.solvedBy += 1;
        });

        return {
          rank: r.rank,
          id: String(r.user),
          username: member?.user?.username ?? "Player",
          score: r.score,
          solvedCount: r.solvedCount,
          finishTimeMs: sinceStart(r.lastSolvedAt),
          solved,
          isMe: String(r.user) === String(userId),
        };
      });

    // ---- summary ----
    const scores = standings.map((s) => s.score);
    let fastest = null;
    for (const player of standings) {
      for (const s of player.solved) {
        if (s.timeMs != null && (!fastest || s.timeMs < fastest.timeMs)) {
          fastest = {
            username: player.username,
            problemTitle: problemById.get(s.problemId)?.title ?? "a problem",
            timeMs: s.timeMs,
          };
        }
      }
    }

    return json({
      ...base,
      owner: pg.owner?.username ?? "Unknown",
      winner: pg.winner ? { id: String(pg.winner._id), username: pg.winner.username } : null,
      settings: {
        durationMinutes: pg.settings.durationMinutes,
        problemCount: pg.settings.problemCount,
        difficulty: pg.settings.difficulty,
      },
      startedAt: pg.startedAt,
      endedAt: pg.endedAt,
      problems,
      standings,
      summary: {
        players: standings.length,
        highestScore: scores.length ? Math.max(...scores) : 0,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        totalSolves: standings.reduce((sum, s) => sum + s.solvedCount, 0),
        fastest,
      },
    });
  } catch (error) {
    console.error("Playground leaderboard failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}