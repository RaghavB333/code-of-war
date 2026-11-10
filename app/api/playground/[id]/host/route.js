import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { emit, lobbyRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds/:id/host   { userId }   (current host only)
// Makes another joined player the host. The old host becomes a normal player.
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const hostId = user?._id;
    if (!hostId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    const { userId: target } = await req.json().catch(() => ({}));
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(target)) return json({ message: "Bad request" }, 400);
    if (String(target) === String(hostId)) return json({ message: "You are already the host." }, 400);

    await connectDB();

    const result = await Playground.updateOne(
      {
        _id: id,
        owner: hostId,
        status: { $in: ["waiting", "active"] },
        members: { $elemMatch: { user: target, status: "joined" } },
      },
      { $set: { owner: target, "members.$[old].role": "player", "members.$[next].role": "owner" } },
      {
        arrayFilters: [
          { "old.user": new mongoose.Types.ObjectId(hostId) },
          { "next.user": new mongoose.Types.ObjectId(target) },
        ],
      }
    );
    if (result.modifiedCount !== 1) return json({ message: "Only the host can do this, and only for a joined player." }, 403);

    emit(lobbyRoom(id), "lobby:updated", { reason: "new-host" });
    return json({ ok: true });
  } catch (error) {
    console.error("Make host failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}