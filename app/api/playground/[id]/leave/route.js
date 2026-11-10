import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { completePlayground } from "@/lib/playground";
import { emit, lobbyRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const joinedAt = (m) => (m.joinedAt ? new Date(m.joinedAt).getTime() : 0);

// POST /api/playgrounds/:id/leave
// Any joined member can leave (waiting or running game).
//  - host leaves  -> the player who joined earliest becomes the new host
//  - last person leaves -> waiting lobby is cancelled, running game is finished
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ message: "Lobby not found" }, 404);

    await connectDB();

    const me = new mongoose.Types.ObjectId(userId);
    const guard = {
      _id: id,
      status: { $in: ["waiting", "active"] },
      members: { $elemMatch: { user: userId, status: "joined" } },
    };

    const pg = await Playground.findOne(guard).lean();
    if (!pg) return json({ message: "You are not in this lobby." }, 409);

    const others = pg.members
      .filter((m) => m.status === "joined" && String(m.user) !== String(userId))
      .sort((a, b) => joinedAt(a) - joinedAt(b));
    const wasHost = String(pg.owner) === String(userId);

    let result;
    if (others.length === 0) {
      result = await Playground.updateOne(
        guard,
        { $set: { "members.$[me].status": "left", ...(pg.status === "waiting" ? { status: "cancelled" } : {}) } },
        { arrayFilters: [{ "me.user": me }] }
      );
    } else if (wasHost) {
      const next = others[0];
      result = await Playground.updateOne(
        guard,
        {
          $set: {
            owner: next.user,
            "members.$[me].status": "left",
            "members.$[me].role": "player",
            "members.$[next].role": "owner",
          },
        },
        { arrayFilters: [{ "me.user": me }, { "next.user": next.user }] }
      );
    } else {
      result = await Playground.updateOne(guard, { $set: { "members.$[me].status": "left" } }, { arrayFilters: [{ "me.user": me }] });
    }

    if (result.modifiedCount !== 1) return json({ message: "Couldn't leave the lobby. Try again." }, 409);

    // nobody left in a running game -> end it (rank list is then empty)
    if (others.length === 0 && pg.status === "active") await completePlayground(id);

    emit(lobbyRoom(id), "lobby:updated", { reason: "left" });
    return json({ ok: true });
  } catch (error) {
    console.error("Leave failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}