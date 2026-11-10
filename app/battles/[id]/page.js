"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Calendar, Clock, Crown, Target, Trophy, Users, Zap } from "lucide-react";
import UserProtectWrapper from "@/components/UserProtectWrapper";

const DIFFICULTY_COLOR = {
  "Give Me Story": "text-emerald-400",
  "Give Me Balanced": "text-amber-400",
  "Give Me Code Of War": "text-red-400",
};

// 1st is the tallest block in the middle, 2nd (left) and 3rd (right) step down.
const PODIUM = {
  1: { block: "h-44", ring: "ring-amber-400", gradient: "from-amber-300 to-amber-600", delay: "0.5s", avatar: "h-20 w-20 md:h-24 md:w-24 text-3xl" },
  2: { block: "h-32", ring: "ring-gray-300", gradient: "from-gray-200 to-gray-500", delay: "0.25s", avatar: "h-16 w-16 md:h-20 md:w-20 text-2xl" },
  3: { block: "h-24", ring: "ring-orange-400", gradient: "from-orange-300 to-orange-600", delay: "0s", avatar: "h-16 w-16 md:h-20 md:w-20 text-2xl" },
};

const ANIMATIONS = `
@keyframes podium-rise { from { transform: scaleY(0); opacity: .3; } to { transform: scaleY(1); opacity: 1; } }
@keyframes pop-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes crown-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.podium-rise { transform-origin: bottom; animation: podium-rise .7s cubic-bezier(.2,.8,.2,1) both; }
.pop-in { animation: pop-in .5s ease both; }
.crown-float { animation: crown-float 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .podium-rise, .pop-in, .crown-float { animation: none; } }
`;

/* ------------------------------- helpers ------------------------------- */

function formatDuration(ms) {
  if (ms == null) return "—";
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

/* ------------------------------ small parts ------------------------------ */

function StatCard({ icon: Icon, label, value, sub, accent = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

// one dot per problem: green = solved (tooltip shows points and time), grey = not solved
function SolveDots({ problems, player }) {
  const solvedBy = new Map(player.solved.map((s) => [s.problemId, s]));
  return (
    <div className="flex flex-wrap gap-1.5" aria-label={`${player.solvedCount} of ${problems.length} problems solved`}>
      {problems.map((p) => {
        const s = solvedBy.get(p.id);
        return (
          <span
            key={p.id}
            title={s ? `${p.title} · +${s.score} · ${formatDuration(s.timeMs)}` : `${p.title} · not solved`}
            className={`h-2.5 w-2.5 rounded-full ${s ? "bg-green-500" : "bg-gray-700"}`}
          />
        );
      })}
    </div>
  );
}

function PodiumSpot({ player, place, problems }) {
  const style = PODIUM[place];
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="pop-in flex w-full flex-col items-center px-1" style={{ animationDelay: `calc(${style.delay} + 0.5s)` }}>
        {place === 1 && <Crown className="crown-float mb-1 h-8 w-8 text-amber-400" aria-hidden="true" />}
        <span
          className={`flex items-center justify-center rounded-full bg-white/10 font-bold uppercase text-white ring-4 ${style.ring} ${style.avatar}`}
        >
          {player.username?.[0] ?? "?"}
        </span>
        <p className="mt-2 w-full truncate text-center font-semibold text-white">
          {player.username}
          {player.isMe && <span className="ml-1 text-xs text-gray-500">(you)</span>}
        </p>
        <p className="font-mono text-xl font-bold text-white md:text-2xl">{player.score}</p>
        <p className="mb-2 text-xs text-gray-500">
          {player.solvedCount}/{problems.length} solved · {formatDuration(player.finishTimeMs)}
        </p>
        <SolveDots problems={problems} player={player} />
      </div>

      <div
        className={`podium-rise mt-3 flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-3 ${style.gradient} ${style.block}`}
        style={{ animationDelay: style.delay }}
      >
        <span className="text-4xl font-black text-black/70 md:text-5xl">{place}</span>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

const BattleResult = ({ params }) => {
  const { id } = React.use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    axios
      .get(`/api/playground/${id}/result`)
      .then(({ data }) => {
        if (!cancelled) setData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "This battle doesn't exist, or you didn't play in it."
              : "Couldn't load the results. Please try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const shell = (children) => (
    <UserProtectWrapper>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-8 text-gray-100 md:px-8">
        <style>{ANIMATIONS}</style>
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gray-800/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-5xl">{children}</div>
      </div>
    </UserProtectWrapper>
  );

  if (loading) {
    return shell(
      <div className="space-y-6" aria-hidden="true">
        <div className="h-10 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="h-80 animate-pulse rounded-xl bg-white/[0.03]" />
        <div className="h-40 animate-pulse rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (error || !data) {
    return shell(
      <div className="flex flex-col items-center gap-4 py-24 text-center text-gray-300">
        <p>{error || "Battle not found."}</p>
        <Link href="/battles" className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white hover:text-black">
          Back to battles
        </Link>
      </div>
    );
  }

  // game not finished yet -> the live view is the lobby page
  if (data.status !== "completed") {
    return shell(
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Trophy className="h-12 w-12 text-gray-600" />
        <h1 className="text-2xl font-semibold text-white">{data.title}</h1>
        <p className="text-gray-400">This war hasn&apos;t finished yet, so there is no final results.</p>
        <Link href={`/party/${data.id}`} className="rounded-lg bg-white px-5 py-2.5 font-semibold text-black hover:bg-gray-200">
          Open lobby
        </Link>
      </div>
    );
  }

  const { standings, problems, summary, settings } = data;
  const topScore = Math.max(...standings.map((s) => s.score), 1);
  const me = standings.find((s) => s.isMe);
  const byRank = (rank) => standings.find((s) => s.rank === rank);
  const rest = standings.filter((s) => s.rank > 3);
  const solvedByAll = Math.max(summary.players, 1);

  return shell(
    <>
      {/* header */}
      <Link
        href="/battles"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All Battles
      </Link>

      <header className="mb-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Trophy className="h-9 w-9 text-amber-400" />
          <h1 className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-300 bg-clip-text py-2 text-3xl font-bold text-transparent md:text-5xl">
            {data.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(data.startedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {settings.durationMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            {settings.problemCount} questions ·{" "}
            <span className={DIFFICULTY_COLOR[settings.difficulty] ?? "text-gray-300"}>
              {settings.difficulty === "mixed" ? "Mixed" : settings.difficulty}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-amber-400" />
            Host: {data.owner}
          </span>
        </div>
      </header>

      {standings.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-12 text-center text-gray-400">
          Nobody was ranked in this game.
        </div>
      ) : (
        <>
          {/* podium: 2nd | 1st | 3rd */}
          <section className="mx-auto mb-10 grid max-w-3xl grid-cols-3 items-end gap-3 md:gap-6" aria-label="Top three">
            {[2, 1, 3].map((place) => {
              const player = byRank(place);
              return player ? (
                <PodiumSpot key={place} player={player} place={place} problems={problems} />
              ) : (
                <div key={place} aria-hidden="true" />
              );
            })}
          </section>

          {/* my result */}
          {me && (
            <section className="pop-in mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5" style={{ animationDelay: "1.1s" }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {me.rank === 1 ? "🏆 You Won This Battle!" : `You finished #${me.rank} of ${summary.players}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {me.solvedCount}/{problems.length} solved · last solve at {formatDuration(me.finishTimeMs)}
                    {me.rank !== 1 && data.winner ? ` · winner: ${data.winner.username}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-3xl font-bold text-white">{me.score}</p>
                  <p className="text-xs text-gray-400">{Math.round((me.score / topScore) * 100)}% of the top score</p>
                </div>
              </div>
            </section>
          )}

          {/* summary */}
          <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Users} label="Players" value={summary.players} />
            <StatCard icon={Trophy} label="Top score" value={summary.highestScore} accent="text-amber-400" />
            <StatCard icon={Target} label="Average score" value={summary.averageScore} accent="text-blue-300" />
            <StatCard
              icon={Zap}
              label="Fastest solve"
              value={summary.fastest ? formatDuration(summary.fastest.timeMs) : "—"}
              sub={summary.fastest ? `${summary.fastest.username} · ${summary.fastest.problemTitle}` : undefined}
              accent="text-emerald-400"
            />
          </section>

          {/* everyone else */}
          {rest.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-white">Rest of the field</h2>
              <ol className="space-y-3">
                {rest.map((player, i) => (
                  <li
                    key={player.id}
                    className={`pop-in rounded-xl border p-4 transition-colors hover:border-white/40 ${
                      player.isMe ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-[#0a0a0a]"
                    }`}
                    style={{ animationDelay: `${1.2 + i * 0.06}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-center text-lg font-bold text-gray-400">#{player.rank}</span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold uppercase">
                        {player.username?.[0] ?? "?"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {player.username}
                          {player.isMe && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <SolveDots problems={problems} player={player} />
                          <span className="text-xs text-gray-500">
                            {player.solvedCount}/{problems.length} · {formatDuration(player.finishTimeMs)}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xl font-bold text-white">{player.score}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-700"
                        style={{ width: `${(player.score / topScore) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* problem breakdown */}
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Problem breakdown</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {problems.map((p, index) => (
                <div key={p.id} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        <span className="mr-2 text-gray-500">{index + 1}.</span>
                        {p.title}
                      </p>
                      <p className={`text-xs ${DIFFICULTY_COLOR[p.difficulty] ?? "text-gray-400"}`}>{p.difficulty}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                      +{p.points}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(p.solvedBy / solvedByAll) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      solved by {p.solvedBy}/{summary.players}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default BattleResult;