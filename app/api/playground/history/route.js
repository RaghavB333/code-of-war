import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { completePlayground } from "@/lib/playground";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const STATUS_FILTERS = {
  all: null,
  inprogress: { $in: ["waiting", "active"] },
  completed: "completed",
};

// GET /api/playgrounds/history?status=all|inprogress|completed&page=1&limit=12
// The logged-in user's playgrounds (the ones they joined), newest first, plus career stats.
// The user comes from the login cookie, never from the URL.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12));
    const statusKey = searchParams.get("status") ?? "all";
    if (!(statusKey in STATUS_FILTERS)) return json({ message: "Invalid status filter." }, 400);

    await connectDB();

    const me = new mongoose.Types.ObjectId(userId);
    const joinedByMe = { members: { $elemMatch: { user: userId, status: "joined" } } };

    // Games whose time ran out while nobody was looking: finish them so the list is accurate.
    const due = await Playground.find({ ...joinedByMe, status: "active", endsAt: { $lte: new Date() } })
      .select("_id")
      .lean();
    for (const { _id } of due) await completePlayground(_id);

    const filter = { ...joinedByMe, ...(STATUS_FILTERS[statusKey] ? { status: STATUS_FILTERS[statusKey] } : {}) };

    const [docs, total, statsRows, inProgress] = await Promise.all([
      Playground.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title status owner winner members settings results createdAt startedAt endsAt endedAt")
        .populate("owner", "username")
        .populate("winner", "username")
        .lean(),
      Playground.countDocuments(filter),
      // career stats from finished games only
      Playground.aggregate([
        { $match: { status: "completed", "results.user": me } },
        { $unwind: "$results" },
        { $match: { "results.user": me } },
        {
          $group: {
            _id: null,
            played: { $sum: 1 },
            wins: { $sum: { $cond: [{ $eq: ["$results.rank", 1] }, 1, 0] } },
            totalScore: { $sum: "$results.score" },
            solved: { $sum: "$results.solvedCount" },
            bestRank: { $min: "$results.rank" },
          },
        },
      ]),
      Playground.countDocuments({ ...joinedByMe, status: { $in: ["waiting", "active"] } }),
    ]);

    const s = statsRows[0] ?? { played: 0, wins: 0, totalScore: 0, solved: 0, bestRank: null };

    const playgrounds = docs.map((pg) => {
      const mine = pg.members.find((m) => String(m.user) === String(userId));
      const result = pg.results?.find((r) => String(r.user) === String(userId));
      return {
        id: String(pg._id),
        title: pg.title,
        status: pg.status,
        role: mine?.role ?? "player",
        owner: pg.owner?.username ?? "Unknown",
        winner: pg.winner ? { id: String(pg.winner._id), username: pg.winner.username } : null,
        playersCount: pg.members.filter((m) => m.status === "joined").length,
        settings: {
          durationMinutes: pg.settings.durationMinutes,
          problemCount: pg.settings.problemCount,
          difficulty: pg.settings.difficulty,
        },
        createdAt: pg.createdAt,
        startedAt: pg.startedAt,
        endsAt: pg.endsAt,
        endedAt: pg.endedAt,
        // what I did in it
        myScore: mine?.totalScore ?? 0,
        mySolved: mine?.solved?.length ?? 0,
        myResult: result ? { rank: result.rank, score: result.score, solvedCount: result.solvedCount } : null,
      };
    });

    return json({
      playgrounds,
      total,
      page,
      hasMore: page * limit < total,
      stats: {
        played: s.played,
        wins: s.wins,
        winRate: s.played ? Math.round((s.wins / s.played) * 100) : 0,
        totalScore: s.totalScore,
        solved: s.solved,
        bestRank: s.bestRank,
        inProgress,
      },
    });
  } catch (error) {
    console.error("Playground history failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}