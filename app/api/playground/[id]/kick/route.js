import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import User from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";
import { emit, lobbyRoom, userRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds/:id/kick   { userId }   (host only)
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const hostId = user?._id;
    if (!hostId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    const { userId: target } = await req.json().catch(() => ({}));
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(target)) return json({ message: "Bad request" }, 400);
    if (String(target) === String(hostId)) return json({ message: "Use Leave to exit the lobby yourself." }, 400);

    await connectDB();

    const result = await Playground.updateOne(
      {
        _id: id,
        owner: hostId, // only the host
        status: { $in: ["waiting", "active"] },
        members: { $elemMatch: { user: target, status: "joined" } },
      },
      { $set: { "members.$.status": "kicked" } }
    );
    if (result.modifiedCount !== 1) return json({ message: "Only the host can remove a joined player." }, 403);

    // tell the removed player directly (user room + the socketId kept by register-user), and refresh everyone
    const removed = await User.findById(target).select("socketId").lean();
    emit([userRoom(target), removed?.socketId].filter(Boolean), "lobby:kicked", { id });
    emit(lobbyRoom(id), "lobby:updated", { reason: "kicked" });

    return json({ ok: true });
  } catch (error) {
    console.error("Kick failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}