import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
import { isInviteExpired } from "@/lib/playground";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// GET /api/playgrounds/mine -> { invites: [...], lobbies: [...] }
export async function GET(req) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user?._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    await connectDB();

    const docs = await Playground.find({ "members.user": userId, status: { $in: ["waiting", "active"] } })
      .select("title status owner members endsAt")
      .populate("owner", "username")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const invites = [];
    const lobbies = [];
    for (const pg of docs) {
      const me = pg.members.find((m) => String(m.user) === String(userId));
      if (!me) continue;
      if (me.status === "invited" && !isInviteExpired(me) && pg.status === "waiting") {
        invites.push({ id: String(pg._id), title: pg.title, from: pg.owner?.username ?? "A friend", invitedAt: me.invitedAt });
      } else if (me.status === "joined") {
        lobbies.push({ id: String(pg._id), title: pg.title, status: pg.status, role: me.role, endsAt: pg.endsAt });
      }
    }

    return json({ invites, lobbies });
  } catch (error) {
    console.error("List playgrounds failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}