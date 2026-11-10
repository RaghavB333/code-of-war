"use client"

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { UserDataContext } from '@/context/UserContext';
import { LobbyDataContext } from '@/context/LobbyContext';
import UserProtectWrapper from '@/components/UserProtectWrapper';
import Heatmap from '@/components/Heatmap';
import {
  FRIENDS_EVENT, acceptFriendRequest, denyFriendRequest, sendFriendRequest, errorMessage,
} from '@/lib/friendActions';
import {
  Mail, User, Bell, UserPlus, Users, Flame, Trophy, Target, Crown, Check, X, Swords,
} from 'lucide-react';

const COLORS = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' };

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ---------- Small reusable pieces ---------- */
const Card = ({ title, icon: Icon, right, children, className = '' }) => (
  <section className={`rounded-xl border border-neutral-800 bg-[#141414] p-5 ${className}`}>
    {title && (
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
          {Icon && <Icon className="h-5 w-5 text-neutral-400" />}
          {title}
        </h2>
        {right}
      </div>
    )}
    {children}
  </section>
);

const Stat = ({ icon: Icon, label, value, tint }) => (
  <div className="rounded-xl border border-neutral-800 bg-[#141414] p-5">
    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${tint}1f` }}>
      <Icon className="h-5 w-5" style={{ color: tint }} />
    </div>
    <p className="text-3xl font-semibold tabular-nums text-white">{value}</p>
    <p className="mt-1 text-sm text-neutral-400">{label}</p>
  </div>
);

/* ---------- Donut chart (pure SVG, no library) ---------- */
const Donut = ({ easy, medium, hard }) => {
  const total = easy + medium + hard;
  const r = 52;
  const c = 2 * Math.PI * r;
  const parts = [
    { v: easy, color: COLORS.easy, name: "Give Me Story" },
    { v: medium, color: COLORS.medium, name: "Give Me Balanced" },
    { v: hard, color: COLORS.hard, name: "Give Me Code Of War" },
  ];
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#262626" strokeWidth="14" />
        {total > 0 &&
          parts.map((p) => {
            if (p.v <= 0) return null;
            const len = (p.v / total) * c;
            const currentOffset = offset;
            offset += len;
            return (
              <circle key={p.name} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="14"
                strokeDasharray={`${len} ${c}`} strokeDashoffset={-currentOffset} strokeLinecap="butt" />
            );
          })}
        <g className="rotate-90" style={{ transformOrigin: "70px 70px" }}>
          <text x="70" y="70" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="600">{total}</text>
          <text x="70" y="88" textAnchor="middle" fill="#a3a3a3" fontSize="10">Solved</text>
        </g>
      </svg>

      <ul className="flex-1 space-y-4 min-w-[160px]">
        {parts.map((p) => (
          <li key={p.name}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-medium" style={{ color: p.color }}>{p.name}</span>
              <span className="tabular-nums text-neutral-300">{p.v}</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-800">
              <div className="h-1.5 rounded-full transition-[width] duration-700"
                style={{ width: `${total ? (p.v / total) * 100 : 0}%`, backgroundColor: p.color }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------- Bar chart (pure SVG) ---------- */
const Bars = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const H = 140, W = 100 / data.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${H + 18}`} preserveAspectRatio="none" className="h-44 w-full">
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1="0" x2="100" y1={H - t * H} y2={H - t * H} stroke="#262626" strokeWidth="0.3" />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * (H - 10);
          return (
            <g key={d.label}>
              <title>{`${d.label}: ${d.value}`}</title>
              <rect x={i * W + W * 0.22} y={H - h} width={W * 0.56} height={Math.max(h, 1.5)} rx="1.2"
                fill={d.value ? '#22c55e' : '#262626'} />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-neutral-500">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const Dashboard = () => {
  const [friendemail, setFriendEmail] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [friends, setFriends] = useState([]);
  const [recentSolved, setRecentSolved] = useState([]);
  const [range, setRange] = useState('week');
  const [sending, setSending] = useState(false);
  const [formStatus, setFormStatus] = useState(null); // { ok, text }
  const [busyEmail, setBusyEmail] = useState(null);

  const { user } = useContext(UserDataContext);
  console.log("frontend user : ", user);
  const { socket } = useContext(LobbyDataContext);
  const userId = user?._id;
  const email = user?.email;

  /* ----- Data fetching ----- */
  const fetchNotifications = useCallback(async (signal) => {
    try {
      const { data } = await axios.get('/api/getnotifications', { withCredentials: true, signal });
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (err) {
      if (!axios.isCancel(err)) console.error('Failed to load notifications', err);
    }
  }, []);

  const fetchFriends = useCallback(async (signal) => {
    try {
      const { data } = await axios.get('/api/friends', { withCredentials: true, signal });
      setFriends(Array.isArray(data.friends) ? data.friends : []);
    } catch (err) {
      if (!axios.isCancel(err)) console.error('Failed to load friends', err);
    }
  }, []);

  const fetchRecentSolved = useCallback(async (signal) => {
    try {
      const { data } = await axios.get('/api/recent-solved?limit=5', { withCredentials: true, signal });
      setRecentSolved(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      if (!axios.isCancel(err)) console.error('Failed to load recent activity', err);
    }
  }, []);

  const loadAll = useCallback(
    (signal) => Promise.allSettled([fetchNotifications(signal), fetchFriends(signal), fetchRecentSolved(signal)]),
    [fetchNotifications, fetchFriends, fetchRecentSolved]
  );

  // Initial load
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    loadAll(controller.signal);
    return () => controller.abort();
  }, [userId, loadAll]);

  useEffect(() => {
    if (!userId) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
        fetchFriends();
      }
    };
    const onFriendsChanged = () => {
      fetchNotifications();
      fetchFriends();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(FRIENDS_EVENT, onFriendsChanged);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(FRIENDS_EVENT, onFriendsChanged);
    };
  }, [userId, fetchNotifications, fetchFriends]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket || !userId) return;
    const onRequest = () => fetchNotifications();
    const onListChanged = () => {
      fetchFriends();
      fetchNotifications();
    };
    const onReconnect = () => loadAll();
    socket.on('addFriendRequestReceived', onRequest);
    socket.on('friend-list-changed', onListChanged);
    socket.on('connect', onReconnect);
    return () => {
      socket.off('addFriendRequestReceived', onRequest);
      socket.off('friend-list-changed', onListChanged);
      socket.off('connect', onReconnect);
    };
  }, [socket, userId, fetchNotifications, fetchFriends, loadAll]);

  /* ----- Actions ----- */
  const handleAccept = async (senderEmail) => {
    if (busyEmail) return;
    setBusyEmail(senderEmail);
    try {
      await acceptFriendRequest(senderEmail, socket);
      setNotifications((prev) => prev.filter((n) => n.senderEmail !== senderEmail));
    } catch (err) {
      console.error(errorMessage(err, 'Could not accept request'), err);
      fetchNotifications(); // stale होने पर list ठीक कर दो
    } finally {
      setBusyEmail(null);
    }
  };

  const handleDeny = async (senderEmail) => {
    if (busyEmail) return;
    setBusyEmail(senderEmail);
    try {
      await denyFriendRequest(senderEmail);
      setNotifications((prev) => prev.filter((n) => n.senderEmail !== senderEmail));
    } catch (err) {
      console.error(errorMessage(err, 'Could not remove request'), err);
      fetchNotifications();
    } finally {
      setBusyEmail(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    setFormStatus(null);
    const res = await sendFriendRequest(socket, email, friendemail.trim());
    setFormStatus({ ok: !!res.ok, text: res.message });
    if (res.ok) {
      setFriendEmail('');
      if (res.accepted) fetchFriends();
    }
    setSending(false);
  };

  /* ----- Derived data ----- */
  const easy = user?.easyproblemssolved || 0;
  const medium = user?.mediumproblemssolved || 0;
  const hard = user?.hardproblemssolved || 0;
  const totalProblems = easy + medium + hard;

  const { week, months } = useMemo(() => {
    const counts = {};
    (user?.submissionDates || []).forEach((d) => { counts[d] = (counts[d] || 0) + 1; });

    const week = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: counts[iso(d)] || 0 };
    });

    const months = [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const value = Object.entries(counts).reduce((s, [k, v]) => (k.startsWith(prefix) ? s + v : s), 0);
      return { label: d.toLocaleDateString('en', { month: 'short' }), value };
    });

    return { week, months };
  }, [user?.submissionDates]);

  return (
    <UserProtectWrapper>
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#0a0a0a]/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                <Crown className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                <p className="text-sm text-neutral-400">Welcome back, {user?.username}</p>
              </div>
            </div>
            <div className="relative rounded-lg p-2 hover:bg-neutral-800">
              <Bell className="h-5 w-5 text-neutral-400" />
              {notifications.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile + stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="col-span-2 flex flex-col gap-4 rounded-xl border border-neutral-800 bg-[#141414] p-4 sm:flex-row sm:items-center sm:p-5 md:col-span-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 sm:h-14 sm:w-14">
                    <User className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white sm:text-xl">{user?.username}</p>
                    <p className="truncate text-xs text-neutral-400 sm:text-sm">{email}</p>
                  </div>
                </div>
                <span className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 sm:ml-auto sm:text-sm">
                  <Swords className="h-4 w-4 text-blue-400" />
                  Code of War
                </span>
              </div>
              <Stat icon={Target} label="Problems solved" value={totalProblems} tint="#60a5fa" />
              <Stat icon={Flame} label="Current streak" value={user?.streak?.current ?? 0} tint="#f97316" />
              <Stat icon={Trophy} label="Best streak" value={user?.streak?.max ?? 0} tint="#eab308" />
              <Stat icon={Users} label="Friends" value={friends.length} tint="#a78bfa" />
            </div>

            <Heatmap />

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card title="Difficulty breakdown" icon={Target}>
                <Donut easy={easy} medium={medium} hard={hard} />
              </Card>
              <Card
                title="Submissions"
                right={
                  <div className="flex rounded-lg bg-neutral-800 p-0.5 text-xs">
                    {[['week', '7 days'], ['month', '6 months']].map(([k, l]) => (
                      <button key={k} onClick={() => setRange(k)}
                        className={`rounded-md px-3 py-1 transition-colors ${range === k ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                }
              >
                <Bars data={range === 'week' ? week : months} />
              </Card>
            </div>

            <Card title="Recent activity">
              {recentSolved.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">No solved problems yet. Solve a problem to see it here.</p>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {recentSolved.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-neutral-200">{item.title}</p>
                        {item.difficulty && (
                          <p className="text-xs capitalize" style={{ color: COLORS[item.difficulty] || '#a3a3a3' }}>
                            {item.difficulty}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">
                        {new Date(item.solvedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card title="Add friend" icon={UserPlus}>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email" required value={friendemail}
                    onChange={(e) => { setFriendEmail(e.target.value); if (formStatus) setFormStatus(null); }}
                    placeholder="Friend's email"
                    className="w-full rounded-lg border border-neutral-800 bg-[#0a0a0a] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60">
                  {sending ? 'Sending...' : 'Send Request'}
                </button>
                {formStatus && (
                  <p role="status" className={`text-sm ${formStatus.ok ? 'text-green-400' : 'text-red-400'}`}>
                    {formStatus.text}
                  </p>
                )}
              </form>
            </Card>

            <Card title="Friend requests" icon={Bell}
              right={<span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs">{notifications.length}</span>}>
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">No pending requests</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.map(({ _id, senderEmail, createdAt }) => (
                    <li key={_id} className="rounded-lg border border-neutral-800 bg-[#0a0a0a] p-3">
                      <p className="text-sm font-medium text-white">{senderEmail.split('@')[0]}</p>
                      <p className="text-xs text-neutral-500">{senderEmail} · {new Date(createdAt).toLocaleDateString()}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleAccept(senderEmail)} disabled={busyEmail === senderEmail}
                          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 py-1.5 text-sm text-white hover:bg-green-500 disabled:opacity-60">
                          <Check className="h-4 w-4" /> Accept
                        </button>
                        <button onClick={() => handleDeny(senderEmail)} disabled={busyEmail === senderEmail}
                          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-neutral-800 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-60">
                          <X className="h-4 w-4" /> Deny
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Friends" icon={Users}
              right={<span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs">{friends.length}</span>}>
              {friends.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">No friends yet. Send a request above.</p>
              ) : (
                <ul className="max-h-72 space-y-2 overflow-y-auto">
                  {friends.map((f) => (
                    <li key={f._id || f.email} className="flex items-center gap-3 rounded-lg p-2 hover:bg-neutral-800/60">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
                        {f.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{f.username}</p>
                        <p className="truncate text-xs text-neutral-500">{f.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </main>
      </div>
    </UserProtectWrapper>
  );
};

export default Dashboard;