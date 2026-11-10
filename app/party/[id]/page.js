"use client";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, Clock, Copy, Crown, LogOut, Swords, Trophy, UserPlus, UserX } from "lucide-react";
import { UserDataContext } from "@/context/UserContext";
import { LobbyDataContext } from "@/context/LobbyContext";
import UserProtectWrapper from "@/components/UserProtectWrapper";

// Any of these means "something changed" -> just ask the server for the fresh state.
const REFRESH_EVENTS = ["lobby:updated", "game:started", "leaderboard:update", "game:ended"];
const POLL_MS = 15000; // safety net in case the socket is down

const DIFFICULTY_COLOR = {
  "Give Me Story": "text-emerald-400",
  "Give Me Balanced": "text-amber-400",
  "Give Me Code Of War": "text-red-400",
};

function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function Panel({ title, right, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

const InvitedChip = ({ remainingMs }) => (
  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
    Invited{remainingMs > 0 ? ` · ${formatClock(remainingMs)}` : ""}
  </span>
);

const iconButton =
  "rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40";

const Party = ({ params }) => {
  const { id } = React.use(params);
  const router = useRouter();
  const { user } = useContext(UserDataContext);
  const { socket } = useContext(LobbyDataContext);

  const [lobby, setLobby] = useState(null);
  const [friends, setFriends] = useState([]);
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const clockOffset = useRef(0); // serverTime - clientTime, so the countdown follows the server

  const fetchLobby = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/playground/${id}`);
      clockOffset.current = new Date(data.serverNow).getTime() - Date.now();
      setLobby(data);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setLobby(null); // removed from the party / it no longer exists
        setError("This party doesn't exist, or you are not part of it.");
      } else {
        setError("Couldn't load the party. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLobby();
  }, [fetchLobby]);

  /* ---------------- realtime: subscribe, refresh on events ---------------- */
  useEffect(() => {
    if (!socket) return;
    const subscribe = () => socket.emit("playground:subscribe", { id });
    const refresh = () => fetchLobby();
    const onKicked = (data) => {
      if (data?.id !== id) return;
      window.alert("The host removed you from this party.");
      router.push("/");
    };

    if (socket.connected) subscribe();
    socket.on("connect", subscribe);
    socket.on("connect", refresh); // after a reconnect we may have missed events
    socket.on("lobby:kicked", onKicked);
    REFRESH_EVENTS.forEach((event) => socket.on(event, refresh));

    return () => {
      socket.emit("playground:unsubscribe", { id });
      socket.off("connect", subscribe);
      socket.off("connect", refresh);
      socket.off("lobby:kicked", onKicked);
      REFRESH_EVENTS.forEach((event) => socket.off(event, refresh));
    };
  }, [socket, id, fetchLobby, router]);

  /* ------ who is online (your server broadcasts `online_users` on every connect / disconnect) ------ */
  useEffect(() => {
    if (!socket) return;
    const onOnline = (ids) => setOnlineIds(new Set((ids ?? []).map(String)));
    const ask = () => socket.emit("fetchOnline_users");

    socket.on("online_users", onOnline);
    socket.on("connect", ask);
    if (socket.connected) ask();

    return () => {
      socket.off("online_users", onOnline);
      socket.off("connect", ask);
    };
  }, [socket]);

  // light polling while the lobby is live
  useEffect(() => {
    if (!lobby || !["waiting", "active"].includes(lobby.status)) return;
    const timer = setInterval(fetchLobby, POLL_MS);
    return () => clearInterval(timer);
  }, [lobby?.status, fetchLobby]);

  /* ------------------------------- countdown ------------------------------- */
  const hasPendingInvites = lobby?.status === "waiting" && lobby.members.some((m) => m.status === "invited");
  const needsClock = lobby?.status === "active" || hasPendingInvites;
  useEffect(() => {
    if (!needsClock) return;
    const tick = () => setNow(Date.now() + clockOffset.current);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [needsClock]);

  const remainingMs = lobby?.endsAt ? new Date(lobby.endsAt).getTime() - now : 0;
  const askedToFinish = useRef(false);
  useEffect(() => {
    if (lobby?.status === "active" && remainingMs <= 0 && !askedToFinish.current) {
      askedToFinish.current = true;
      fetchLobby(); // the server finishes the game when it is asked after time is up
    }
  }, [remainingMs, lobby?.status, fetchLobby]);

  /* -------------------------------- friends -------------------------------- */
  const isOwner = lobby?.me?.role === "owner";
  const isJoined = lobby?.me?.status === "joined";
  useEffect(() => {
    // every joined player can invite THEIR OWN friends while the lobby is waiting
    if (!isJoined || lobby?.status !== "waiting") return;
    axios
      .get("/api/friends")
      .then(({ data }) => setFriends(data.friends ?? []))
      .catch(() => {});
  }, [isJoined, lobby?.status]);

  /* -------------------------------- actions -------------------------------- */
  const run = async (key, task) => {
    setBusy(key);
    setError("");
    try {
      await task();
      await fetchLobby();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const invite = (friendId) =>
    run(`invite:${friendId}`, () => axios.post(`/api/playground/${id}/invite`, { userIds: [friendId] }));

  const start = () => run("start", () => axios.post(`/api/playground/${id}/start`));

  const kick = (member) => {
    if (!window.confirm(`Remove ${member.username} from the party?`)) return;
    run(`kick:${member.id}`, () => axios.post(`/api/playground/${id}/kick`, { userId: member.id }));
  };

  const makeHost = (member) => {
    if (!window.confirm(`Make ${member.username} the host? You will lose the host controls.`)) return;
    run(`host:${member.id}`, () => axios.post(`/api/playground/${id}/host`, { userId: member.id }));
  };

  const leave = async () => {
    const warning = isOwner ? "You are the host. Leaving passes the host role to another player. Leave anyway?" : "Leave this party?";
    if (!window.confirm(warning)) return;
    setBusy("leave");
    try {
      await axios.post(`/api/playground/${id}/leave`);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't leave the party.");
      setBusy("");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobby.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  /* --------------------------------- render --------------------------------- */
  if (loading) {
    return (
      <UserProtectWrapper>
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">Loading party…</div>
      </UserProtectWrapper>
    );
  }

  if (!lobby) {
    return (
      <UserProtectWrapper>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-gray-300">
          <p>{error || "Party not found."}</p>
          <Link href="/" className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white hover:text-black">
            Go home
          </Link>
        </div>
      </UserProtectWrapper>
    );
  }

  const { members, leaderboard, problems, results, settings } = lobby;
  const isInvited = lobby.me.status === "invited";
  const joinedMembers = members.filter((m) => m.status === "joined"); // LEFT panel: only people who joined
  const joinedCount = joinedMembers.length;
  // an invite only holds a seat until it expires (the server uses the same rule)
  const inviteActive = (m) => m.status === "invited" && new Date(m.inviteExpiresAt).getTime() > now;
  const seatsTaken = members.filter((m) => m.status === "joined" || inviteActive(m)).length;
  const full = seatsTaken >= settings.maxPlayers;
  const canStart = isOwner && joinedCount >= lobby.minPlayersToStart;
  const canLeave = isJoined && ["waiting", "active"].includes(lobby.status);

  // RIGHT panel: my friends who have NOT joined. Online ones first.
  const memberOf = (friendId) => members.find((m) => m.id === friendId);
  const friendStatus = (friendId) => {
    const m = memberOf(friendId);
    if (!m) return undefined;
    return m.status === "invited" && !inviteActive(m) ? undefined : m.status; // expired invite -> can invite again
  };
  const invitable = friends
    .filter((f) => friendStatus(f._id) !== "joined")
    .map((f) => ({
      ...f,
      online: onlineIds.has(String(f._id)),
      status: friendStatus(f._id),
      expiresAt: memberOf(f._id)?.inviteExpiresAt,
    }))
    .sort((a, b) => Number(b.online) - Number(a.online) || a.username.localeCompare(b.username));

  return (
    <UserProtectWrapper>
      <div className="min-h-screen bg-[#0a0a0a] p-4 text-gray-100 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* header */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Swords className="h-8 w-8 text-blue-300" />
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">{lobby.title}</h1>
                <p className="text-sm text-gray-400">
                  {settings.problemCount} questions · {settings.durationMinutes} min ·{" "}
                  {settings.difficulty === "mixed" ? "Mixed" : settings.difficulty}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {lobby.code && lobby.status === "waiting" && (
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-sm tracking-widest text-gray-200 transition-colors hover:bg-white hover:text-black"
                  title="Copy lobby code"
                >
                  {lobby.code}
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
              {lobby.status === "active" && (
                <div
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xl font-bold ${
                    remainingMs <= 60000 ? "border-red-500/50 text-red-400" : "border-white/10 text-white"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  {formatClock(remainingMs)}
                </div>
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
                {lobby.status}
              </span>
              {canLeave && (
                <button
                  onClick={leave}
                  disabled={busy !== ""}
                  className="flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {busy === "leave" ? "Leaving…" : "Leave"}
                </button>
              )}
            </div>
          </header>

          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

          {/* Joining happens from the invite popup, so there is no Accept / Decline here. */}
          {isInvited && (
            <p className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-center text-gray-300">
              You&apos;ve been invited. Accept the invite from the popup to join this party.
            </p>
          )}

          {/* ---------------------------- waiting ---------------------------- */}
          {lobby.status === "waiting" && (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* LEFT: only players who have joined */}
                <Panel title={`Players (${joinedCount}/${settings.maxPlayers})`}>
                  <ul className="max-h-96 overflow-y-auto">
                    {joinedMembers.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 border-b border-white/5 p-4 last:border-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold uppercase">
                            {m.username?.[0] ?? "?"}
                          </span>
                          <span className="truncate text-gray-200">
                            {m.username}
                            {m.id === user?._id && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                          </span>
                          {m.role === "owner" && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                              <Crown className="h-3 w-3" /> Host
                            </span>
                          )}
                        </div>

                        {isOwner && m.id !== user?._id && (
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => makeHost(m)}
                              disabled={busy !== ""}
                              className={iconButton}
                              title="Make host"
                              aria-label={`Make ${m.username} the host`}
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => kick(m)}
                              disabled={busy !== ""}
                              className={iconButton}
                              title="Remove from lobby"
                              aria-label={`Remove ${m.username}`}
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Panel>

                {/* RIGHT: my friends who haven't joined; only online ones can be invited */}
                {isJoined && (
                  <Panel title="Invite friends">
                    <ul className="max-h-96 overflow-y-auto">
                      {invitable.length === 0 && (
                        <li className="p-6 text-center text-sm text-gray-500">
                          {friends.length === 0 ? "No friends to invite yet." : "All your friends have joined."}
                        </li>
                      )}
                      {invitable.map((friend) => (
                        <li key={friend._id} className="flex items-center justify-between gap-3 border-b border-white/5 p-4 last:border-0">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold uppercase">
                              {friend.username?.[0] ?? "?"}
                              {friend.online && (
                                <span
                                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-green-500"
                                  aria-label="Online"
                                />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-gray-200">{friend.username}</p>
                              <p className={`text-xs ${friend.online ? "text-green-400" : "text-gray-500"}`}>
                                {friend.online ? "Online" : "Offline"}
                              </p>
                            </div>
                          </div>

                          {friend.status === "invited" ? (
                            <InvitedChip remainingMs={new Date(friend.expiresAt).getTime() - now} />
                          ) : (
                            <button
                              onClick={() => invite(friend._id)}
                              disabled={!friend.online || busy !== "" || full}
                              title={friend.online ? "Send invite" : "Only online friends can be invited"}
                              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <UserPlus className="h-4 w-4" />
                              {busy === `invite:${friend._id}` ? "Inviting…" : "Invite"}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {full && <p className="p-4 text-sm text-amber-400">The lobby is full.</p>}
                  </Panel>
                )}
              </div>

              {isOwner && (
                <div className="text-center">
                  <button
                    onClick={start}
                    disabled={!canStart || busy !== ""}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-12 py-4 text-xl font-bold text-white shadow-2xl shadow-blue-900/50 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {busy === "start" ? "Starting…" : "Start War"}
                  </button>
                  {!canStart && (
                    <p className="mt-3 text-sm text-gray-500">
                      Waiting for at least {lobby.minPlayersToStart} players to join.
                    </p>
                  )}
                </div>
              )}
              {!isOwner && isJoined && <p className="text-center text-gray-500">Waiting for the host to start the war…</p>}
            </>
          )}

          {/* ----------------------------- active ----------------------------- */}
          {lobby.status === "active" && problems && (
            <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
              <Panel title="Problems">
                <ul>
                  {problems.map((p) => (
                    <li key={p.id} className="border-b border-white/5 last:border-0">
                      <Link
                        href={`/code-editor/${p.slug}?party=${lobby.id}`}
                        className="group flex items-center gap-4 p-4 transition-colors hover:bg-gray-100 hover:text-black"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            p.solvedByMe ? "bg-green-500 text-white" : "bg-gray-700 text-gray-500"
                          }`}
                          aria-label={p.solvedByMe ? "Solved" : "Not solved"}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                        <span className={`hidden text-sm sm:block ${DIFFICULTY_COLOR[p.difficulty] ?? "text-gray-400"}`}>
                          {p.difficulty}
                        </span>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black">+{p.points}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Leaderboard" right={<Trophy className="h-5 w-5 text-amber-400" />}>
                <ol>
                  {leaderboard.map((row) => (
                    <li
                      key={row.id}
                      className={`flex items-center gap-3 border-b border-white/5 p-4 last:border-0 ${
                        row.id === user?._id ? "bg-white/5" : ""
                      }`}
                    >
                      <span className="w-6 text-center font-bold text-gray-400">{row.rank}</span>
                      <span className="min-w-0 flex-1 truncate text-gray-200">{row.username}</span>
                      <span className="text-sm text-gray-500">
                        {row.solvedCount}/{problems.length}
                      </span>
                      <span className="w-14 text-right font-mono font-bold text-white">{row.score}</span>
                      {isOwner && row.id !== user?._id && (
                        <button
                          onClick={() => kick({ id: row.id, username: row.username })}
                          disabled={busy !== ""}
                          className={iconButton}
                          title="Remove from the party"
                          aria-label={`Remove ${row.username}`}
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>
          )}

          {/* ---------------------------- completed ---------------------------- */}
          {lobby.status === "completed" && (
            <Panel title="Final results" right={<Trophy className="h-5 w-5 text-amber-400" />}>
              {lobby.winner && (
                <p className="border-b border-white/10 p-4 text-center text-lg text-amber-300">
                  🏆 {lobby.winner.username} won!
                </p>
              )}
              <ol>
                {(results ?? []).map((row) => (
                  <li
                    key={row.id}
                    className={`flex items-center gap-3 border-b border-white/5 p-4 last:border-0 ${
                      row.id === user?._id ? "bg-white/5" : ""
                    }`}
                  >
                    <span className="w-8 text-center text-xl font-bold text-gray-300">{row.rank}</span>
                    <span className="min-w-0 flex-1 truncate text-gray-100">{row.username}</span>
                    <span className="text-sm text-gray-500">{row.solvedCount} solved</span>
                    <span className="w-16 text-right font-mono font-bold text-white">{row.score}</span>
                  </li>
                ))}
              </ol>
              <div className="p-4 text-center">
                <Link href="/" className="rounded-lg border border-white/10 px-5 py-2 text-gray-300 transition-colors hover:bg-white hover:text-black">
                  Back home
                </Link>
              </div>
            </Panel>
          )}

          {lobby.status === "cancelled" && <p className="text-center text-gray-400">This party was cancelled.</p>}
        </div>
      </div>
    </UserProtectWrapper>
  );
};

export default Party;