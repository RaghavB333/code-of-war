import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import User from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";
import { INVITE_TTL_MS, effectiveStatus } from "@/lib/playground";
import { emit, getOnlineUserIds, lobbyRoom, userRoom } from "@/lib/realtime";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds/:id/invite   { userIds: [..] }
export async function POST(req, { params }) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const ownerId = user?._id;
    if (!ownerId) return json({ message: "Please log in." }, 401);

    const { id } = await params;
    const { userIds } = await req.json().catch(() => ({}));
    if (!mongoose.isValidObjectId(id)) return json({ message: "Lobby not found" }, 404);

    const targets = Array.isArray(userIds) ? [...new Set(userIds.map(String))] : [];
    if (!targets.length || targets.length > 10 || !targets.every((t) => mongoose.isValidObjectId(t))) {
      return json({ message: "Choose who to invite." }, 400);
    }

    await connectDB();

    // any member who has joined can invite (not only the host), until the game starts
    const pg = await Playground.findOne({
      _id: id,
      status: "waiting",
      members: { $elemMatch: { user: ownerId, status: "joined" } },
    }).lean();
    if (!pg) return json({ message: "Only players who joined can invite, and only before the game starts." }, 403);

    // Only the inviter's own friends can be invited.
    const owner = await User.findById(ownerId).select("username friends").lean();
    const friendIds = new Set((owner?.friends ?? []).map(String));
    if (!targets.every((t) => friendIds.has(t))) return json({ message: "You can only invite your friends." }, 403);

    // Only friends who are online right now (skipped if the socket service is unreachable).
    const online = await getOnlineUserIds(targets);
    if (online && targets.some((t) => !online.includes(t))) {
      return json({ message: "Only friends who are online can be invited." }, 409);
    }

    const accounts = await User.find({ _id: { $in: targets }, accountStatus: "active" }).select("_id socketId").lean();
    if (accounts.length !== targets.length) return json({ message: "Some users can't be invited." }, 400);
    const socketOf = new Map(accounts.map((a) => [String(a._id), a.socketId]));

    // Capacity counts joined people + invites that are still valid (an unanswered invite expires).
    const rawStatus = new Map(pg.members.map((m) => [String(m.user), m.status]));
    const taken = new Map(pg.members.map((m) => [String(m.user), effectiveStatus(m)]));
    const toInvite = targets.filter((t) => !["joined", "invited"].includes(taken.get(t)));
    const seats = pg.members.filter((m) => ["joined", "invited"].includes(effectiveStatus(m))).length;
    if (seats + toInvite.length > pg.settings.maxPlayers) {
      return json({ message: `This lobby is limited to ${pg.settings.maxPlayers} players.` }, 409);
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - INVITE_TTL_MS); // invites sent before this have expired
    const invited = [];
    for (const target of toInvite) {
      const previous = rawStatus.get(target); // what is stored in the database
      const result = previous
        ? // someone who declined / left earlier: re-invite
          await Playground.updateOne(
            { _id: id, status: "waiting", members: { $elemMatch: { user: target, status: previous, ...(previous === "invited" ? { invitedAt: { $lt: cutoff } } : {}) } } },
            { $set: { "members.$.status": "invited", "members.$.invitedAt": now, "members.$.invitedBy": ownerId } }
          )
        : await Playground.updateOne(
            { _id: id, status: "waiting", "members.user": { $ne: target } },
            { $push: { members: { user: target, status: "invited", invitedBy: ownerId, invitedAt: now } } }
          );

      if (result.modifiedCount === 1) {
        invited.push(target);
        // user room (works across tabs) + the socketId your register-user handler keeps in the DB
        emit([userRoom(target), socketOf.get(target)].filter(Boolean), "invite:received", { id, title: pg.title, from: owner?.username ?? "A friend", invitedAt: now });
      }
    }

    if (invited.length) emit(lobbyRoom(id), "lobby:updated", { reason: "invited" });
    return json({ invited });
  } catch (error) {
    console.error("Invite failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}