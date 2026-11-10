"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Clock, Crown, Loader2, Plus, Swords, Target, Trophy, Users } from "lucide-react";
import { UserDataContext } from "@/context/UserContext";
import UserProtectWrapper from "@/components/UserProtectWrapper";

const CREATE_ROUTE = "/party";
const PAGE_SIZE = 12;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "inprogress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

const STATUS = {
  waiting: { label: "Waiting", chip: "bg-amber-500/10 text-amber-400" },
  active: { label: "Live", chip: "bg-emerald-500/10 text-emerald-400" },
  completed: { label: "Completed", chip: "bg-blue-500/10 text-blue-400" },
  cancelled: { label: "Cancelled", chip: "bg-gray-500/10 text-gray-400" },
};

const DIFFICULTY_COLOR = {
  "Give Me Story": "text-emerald-400",
  "Give Me Balanced": "text-amber-400",
  "Give Me Code Of War": "text-red-400",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

/* ------------------------------ small parts ------------------------------ */

function StatCard({ icon: Icon, label, value, accent = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function RankBadge({ rank }) {
  const style =
    rank === 1
      ? "bg-amber-400 text-black"
      : rank === 2
      ? "bg-gray-300 text-black"
      : rank === 3
      ? "bg-orange-400 text-black"
      : "bg-white/10 text-gray-200";
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style}`}>
      {rank === 1 ? <Trophy className="h-5 w-5" /> : `#${rank}`}
    </span>
  );
}

function Info({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Icon className="h-4 w-4 shrink-0 text-gray-500" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function PlaygroundCard({ item, now }) {
  const status = STATUS[item.status] ?? STATUS.cancelled;
  const isLive = item.status === "active";
  const isDone = item.status === "completed";
  const minutesLeft = isLive ? Math.max(0, Math.ceil((new Date(item.endsAt).getTime() - now) / 60000)) : 0;
  const iWon = item.myResult?.rank === 1;

  return (
    <Link
      href={isDone ? `/battles/${item.id}` : `/party/${item.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-blue-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
          </p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.chip}`}>
          {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
          {status.label}
        </span>
      </div>

      {/* details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Info icon={Users}>{item.playersCount} player{item.playersCount === 1 ? "" : "s"}</Info>
        <Info icon={Clock}>{item.settings.durationMinutes} min</Info>
        <Info icon={Target}>{item.settings.problemCount} questions</Info>
        <span
          className={`truncate text-sm font-medium ${
            DIFFICULTY_COLOR[item.settings.difficulty] ?? "text-gray-400"
          }`}
        >
          {item.settings.difficulty === "mixed" ? "Mixed" : item.settings.difficulty}
        </span>
      </div>

      {/* result / progress */}
      <div className="mt-4 flex-1 border-t border-white/10 pt-4">
        {isDone && item.myResult && (
          <div className="flex items-center gap-3">
            <RankBadge rank={item.myResult.rank} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{iWon ? "You won!" : `You finished #${item.myResult.rank}`}</p>
              <p className="truncate text-xs text-gray-500">
                {item.myResult.solvedCount}/{item.settings.problemCount} solved
                {!iWon && item.winner ? ` · 🏆 ${item.winner.username}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-bold text-white">{item.myResult.score}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        )}

        {isDone && !item.myResult && <p className="text-sm text-gray-500">Finished without a ranking.</p>}

        {isLive && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{minutesLeft > 0 ? `${minutesLeft} min left` : "Wrapping up…"}</p>
              <p className="text-xs text-gray-500">
                {item.mySolved}/{item.settings.problemCount} solved
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-bold text-white">{item.myScore}</p>
              <p className="text-xs text-gray-500">points so far</p>
            </div>
          </div>
        )}

        {item.status === "waiting" && <p className="text-sm text-gray-400">Waiting for players to join…</p>}
        {item.status === "cancelled" && <p className="text-sm text-gray-500">This lobby was cancelled.</p>}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-500">
          {item.role === "owner" ? (
            <>
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              You are the host
            </>
          ) : (
            <>Host: {item.owner}</>
          )}
        </span>
        <span className="flex items-center gap-1 font-medium text-blue-400 transition-transform group-hover:translate-x-1">
          {isLive || item.status === "waiting" ? "Open lobby" : "View results"}
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      ))}
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

const YourBattles = () => {
  const { user } = useContext(UserDataContext);
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(
    async (pageNumber, replace) => {
      try {
        replace ? setLoading(true) : setLoadingMore(true);
        setError(null);
        const { data } = await axios.get("/api/playground/history", {
          params: { status: filter, page: pageNumber, limit: PAGE_SIZE},
        }, {withCredentials: true});
        setItems((prev) => (replace ? data.playgrounds : [...prev, ...data.playgrounds]));
        setStats(data.stats);
        setPage(pageNumber);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Error fetching playgrounds:", err);
        setError(err.response?.data?.message || "Failed to fetch playgrounds. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, user?._id]
  );

  useEffect(() => {
    if (user?._id) load(1, true);
  }, [user?._id, load]);

  // keeps the "x min left" text of live games fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const hasGames = (stats?.played ?? 0) + (stats?.inProgress ?? 0) > 0 || items.length > 0;

  return (
    <UserProtectWrapper>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-8 text-gray-100 md:px-8">
        {/* soft background glow, same as the create-lobby page */}
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gray-800/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* header */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Swords className="h-9 w-9 text-blue-300" />
                <h1 className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-300 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  YOUR BATTLES
                </h1>
              </div>
              <p className="mt-2 text-gray-400">
                Welcome back, <span className="font-semibold text-white">{user?.username || user?.email}</span>. Here is every battle you have played.
              </p>
            </div>
            <button
              onClick={() => router.push(CREATE_ROUTE)}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-black transition-colors hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              New Battle
            </button>
          </div>

          {/* career stats */}
          {stats && hasGames && (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <StatCard icon={Swords} label="Games" value={stats.played} />
              <StatCard icon={Trophy} label="Wins" value={stats.wins} accent="text-amber-400" />
              <StatCard icon={Target} label="Win rate" value={`${stats.winRate}%`} accent="text-emerald-400" />
              <StatCard icon={Crown} label="Best rank" value={stats.bestRank ? `#${stats.bestRank}` : "—"} />
              <StatCard icon={Trophy} label="Points" value={stats.totalScore} accent="text-blue-300" />
              <StatCard icon={Target} label="Solved" value={stats.solved} />
            </div>
          )}

          {/* filters */}
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter playgrounds">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  filter === f.id
                    ? "border-white bg-white font-semibold text-black"
                    : "border-white/10 text-gray-400 hover:border-white/40 hover:text-white"
                }`}
              >
                {f.label}
                {f.id === "inprogress" && stats?.inProgress > 0 && (
                  <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 text-xs text-emerald-400">{stats.inProgress}</span>
                )}
              </button>
            ))}
          </div>

          {/* error */}
          {error && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <div>
                <h3 className="font-semibold text-red-300">Couldn&apos;t load your battles</h3>
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <button
                onClick={() => load(1, true)}
                className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500 hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* grid */}
          {loading ? (
            <SkeletonGrid />
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <PlaygroundCard key={item.id} item={item} now={now} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => load(page + 1, false)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-2.5 text-gray-300 transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          ) : (
            !error && (
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] px-6 py-14 text-center">
                <Swords className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <h3 className="mb-2 text-2xl font-semibold text-white">
                  {filter === "all" ? "No playgrounds yet" : "Nothing here"}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-gray-500">
                  {filter === "all"
                    ? "Create a playground, invite your friends and see who solves the most problems."
                    : "No playgrounds match this filter."}
                </p>
                {filter === "all" ? (
                  <button
                    onClick={() => router.push(CREATE_ROUTE)}
                    className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
                  >
                    Create your first battle
                  </button>
                ) : (
                  <button onClick={() => setFilter("all")} className="text-blue-400 hover:underline">
                    Show all
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </UserProtectWrapper>
  );
};

export default YourBattles;