import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { INVITE_TTL_MS } from "@/lib/playground";
import { emit, lobbyRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds/:id/respond   { accept: true | false }
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    const { accept } = await req.json().catch(() => ({}));
    if (!mongoose.isValidObjectId(id) || typeof accept !== "boolean") return json({ message: "Bad request" }, 400);

    await connectDB();

    const invited = { $elemMatch: { user: userId, status: "invited" } };
    const stillValid = {
      $elemMatch: { user: userId, status: "invited", invitedAt: { $gte: new Date(Date.now() - INVITE_TTL_MS) } },
    };

    if (accept) {
      // One atomic step: still waiting, I'm still invited, and there is a free seat.
      const result = await Playground.updateOne(
        {
          _id: id,
          status: "waiting",
          members: stillValid,
          $expr: {
            $lt: [
              { $size: { $filter: { input: "$members", as: "m", cond: { $eq: ["$$m.status", "joined"] } } } },
              "$settings.maxPlayers",
            ],
          },
        },
        { $set: { "members.$.status": "joined", "members.$.joinedAt": new Date() } }
      );
      if (result.modifiedCount !== 1) {
        return json({ message: "You can't join this lobby anymore (it's full, started, or the invite expired)." }, 409);
      }
    } else {
      const result = await Playground.updateOne({ _id: id, members: invited }, { $set: { "members.$.status": "declined" } });
      if (result.modifiedCount !== 1) return json({ message: "No pending invite found." }, 409);
    }

    emit(lobbyRoom(id), "lobby:updated", { reason: accept ? "joined" : "declined" });
    return json({ ok: true });
  } catch (error) {
    console.error("Respond failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}