import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { completeIfDue, effectiveStatus, serializeState } from "@/lib/playground";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// GET /api/playgrounds/:id  -> everything the lobby page needs, from the viewer's point of view.
// Problems are only included once the game has started and only for joined members.
export async function GET(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return json({ message: "Lobby not found" }, 404);

    await connectDB();

    // If the clock has run out, finish the game before answering.
    const head = await Playground.findById(id).select("status endsAt").lean();
    if (!head) return json({ message: "Lobby not found" }, 404);
    await completeIfDue(head);

    const pg = await Playground.findById(id)
      .populate("members.user", "username")
      .populate("problems.problem", "title slug difficulty")
      .populate("winner", "username")
      .lean();

    const me = pg.members.find((m) => String(m.user?._id) === String(userId));
    // 404 (not 403) so lobby ids can't be probed by outsiders.
    if (!me || !["invited", "joined"].includes(effectiveStatus(me))) return json({ message: "Lobby not found" }, 404);

    return json(serializeState(pg, userId));
  } catch (error) {
    console.error("Get playground failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}