import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import Problem from "@/models/problems";
import { authUser } from "@/app/middlewares/auth.middleware";
import { MIN_PLAYERS_TO_START } from "@/lib/playground";
import { emit, lobbyRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds/:id/start   (owner only)
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ message: "Lobby not found" }, 404);

    await connectDB();

    const pg = await Playground.findOne({ _id: id, owner: userId, status: "waiting" }).lean();
    if (!pg) return json({ message: "Only the owner can start a lobby that hasn't started yet." }, 403);

    const joined = pg.members.filter((m) => m.status === "joined").length;
    if (joined < MIN_PLAYERS_TO_START) {
      return json({ message: `At least ${MIN_PLAYERS_TO_START} players must join before you can start.` }, 409);
    }

    // ---- pick the problems once, here (never on a GET) ----
    let picked = [];
    if (pg.selection?.mode === "manual") {
      const docs = await Problem.find({ _id: { $in: pg.selection.problemIds }, visibility: "published" })
        .select("difficulty")
        .lean();
      const byId = new Map(docs.map((d) => [String(d._id), d]));
      picked = pg.selection.problemIds.map((pid) => byId.get(String(pid))).filter(Boolean); // keep the owner's order
    } else {
      const match = { visibility: "published" };
      if (pg.settings.difficulty !== "mixed") match.difficulty = pg.settings.difficulty;
      picked = await Problem.aggregate([
        { $match: match },
        { $sample: { size: pg.settings.problemCount } },
        { $project: { difficulty: 1 } },
      ]);
    }
    if (!picked.length) return json({ message: "No problems are available for these settings." }, 422);

    const points = pg.settings.pointsByDifficulty ?? {};
    const problems = picked.map((p, i) => ({ problem: p._id, points: points[p.difficulty] ?? 100, order: i + 1 }));

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + pg.settings.durationMinutes * 60 * 1000);

    // Atomic: only one Start can win; people who never answered the invite are expired.
    const result = await Playground.updateOne(
      { _id: id, owner: userId, status: "waiting" },
      { $set: { status: "active", problems, startedAt, endsAt, "members.$[m].status": "expired" } },
      { arrayFilters: [{ "m.status": "invited" }] }
    );
    if (result.modifiedCount !== 1) return json({ message: "This lobby has already started." }, 409);

    emit(lobbyRoom(id), "game:started", { id, endsAt });
    return json({ ok: true, endsAt });
  } catch (error) {
    console.error("Start failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}