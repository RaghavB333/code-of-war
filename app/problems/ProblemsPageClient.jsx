"use client";

import { Suspense, useCallback, useContext ,useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "lucide-react";

import { UserDataContext } from "@/context/UserContext";


const PAGE_SIZE = 15;
const VISIBLE_TOPICS = 12;

const DIFFICULTIES = [
  { value: "", label: "All", text: "text-gray-300", active: "border-gray-300 bg-white/10 text-white" },
  { value: "Give Me Story", label: "Give Me Story", text: "text-green-500", active: "border-green-500 bg-green-500/10 text-green-500" },
  { value: "Give Me Balanced", label: "Give Me Balanced", text: "text-orange-500", active: "border-orange-500 bg-orange-500/10 text-orange-500" },
  { value: "Give Me Code Of War", label: "Give Me Code Of War", text: "text-red-500", active: "border-red-500 bg-red-500/10 text-red-500" },
];

const getDifficultyColor = (difficulty) =>
  DIFFICULTIES.find((d) => d.value === difficulty)?.text ?? "text-gray-500";

/* ----------------------------- helpers ----------------------------- */

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

/* ---------------------------- small parts ---------------------------- */

function StatusCircle({ solved }) {
  return (
    <CheckCircleIcon className={solved ? "text-green-500" : "text-gray-500"} />
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function Chip({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 rounded-lg px-4 py-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-800" />
          <div className="h-5 flex-1 animate-pulse rounded bg-gray-800" />
          <div className="hidden h-4 w-28 animate-pulse rounded bg-gray-800 sm:block" />
        </li>
      ))}
    </ul>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn =
    "min-w-9 h-9 px-3 rounded-lg text-sm border border-gray-800 text-gray-300 transition-colors hover:bg-gray-100 hover:text-black disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {getPageRange(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-gray-500">…</span>
        ) : (
          <button
            key={p}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={`${btn} ${p === page ? "!border-blue-500 !bg-blue-500 !text-white" : ""}`}
          >
            {p}
          </button>
        )
      )}
      <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

/* ------------------------------- page ------------------------------- */

function ProblemsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useContext(UserDataContext);

  // URL is the single source of truth, so filters survive refresh and can be shared.
  const q = searchParams.get("q") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput);

  const [data, setData] = useState({ problems: [], total: 0, totalPages: 1 });
  const [topics, setTopics] = useState([]);
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const updateParams = useCallback(
    (patch) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === "" || value == null || (key === "page" && Number(value) === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Push the debounced search term into the URL (and reset to page 1).
  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next !== q) updateParams({ q: next, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch whenever the filters or page change.
  const apiQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);
    if (user?._id) params.set("userId", user._id); 
    return params.toString();
  }, [q, topic, difficulty, page, user?._id]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/problems?${apiQuery}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((json) => {
        console.log("Fetched problems:", json);
        setData({
          problems: json.problems ?? [],
          total: json.total ?? 0,
          totalPages: json.totalPages ?? 1,
        });
        if (json.topics) setTopics(json.topics);
        setSolvedIds(new Set(json.solvedIds ?? []));
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Error fetching problems:", err);
        setError("We couldn't load the problems. Please try again.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [apiQuery]);

  const handlePageChange = (next) => {
    updateParams({ page: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateParams({ q: "", topic: "", difficulty: "", page: 1 });
  };

  const hasFilters = Boolean(q || topic || difficulty);
  const visibleTopics = showAllTopics ? topics : topics.slice(0, VISIBLE_TOPICS);
  const firstItem = data.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, data.total);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-4xl rounded-lg bg-[#0a0a0a] p-4 shadow-md sm:p-6">
        <h1 className="mb-6 text-center text-2xl font-bold text-white sm:text-left sm:text-3xl">
          Available Problems
        </h1>

        {/* Search */}
        <div className="relative mb-5">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title…"
            aria-label="Search problems"
            className="w-full rounded-lg border border-gray-800 bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Difficulty filter */}
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d.value || "all"}
              active={difficulty === d.value}
              onClick={() => updateParams({ difficulty: d.value, page: 1 })}
              className={
                difficulty === d.value
                  ? d.active
                  : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }
            >
              {d.label}
            </Chip>
          ))}
        </div>

        {/* Topic filter */}
        {topics.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by topic">
            <Chip
              active={topic === ""}
              onClick={() => updateParams({ topic: "", page: 1 })}
              className={
                topic === ""
                  ? "border-blue-500 bg-blue-500/10 text-blue-500"
                  : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }
            >
              All topics
            </Chip>
            {visibleTopics.map((t) => (
              <Chip
                key={t}
                active={topic === t}
                onClick={() => updateParams({ topic: topic === t ? "" : t, page: 1 })}
                className={
                  topic === t
                    ? "border-blue-500 bg-blue-500/10 text-blue-500"
                    : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                }
              >
                {t}
              </Chip>
            ))}
            {topics.length > VISIBLE_TOPICS && (
              <button
                type="button"
                onClick={() => setShowAllTopics((v) => !v)}
                className="px-2 text-sm text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showAllTopics ? "Show less" : `+${topics.length - VISIBLE_TOPICS} more`}
              </button>
            )}
          </div>
        )}

          <hr></hr>

        {/* Result summary */}
        {!loading && !error && data.total > 0 && (
          <div className="mb-3 mt-3 flex items-center justify-between px-1 text-sm text-gray-500" aria-live="polite">
            <span>
              Showing {firstItem}–{lastItem} of {data.total}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-blue-500 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}
        


        {/* List */}
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-400">{error}</p>
            <button
              onClick={() => router.refresh()}
              className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-100 hover:text-black"
            >
              Try again
            </button>
          </div>
        ) : data.problems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-400">
              {hasFilters
                ? "No problems match your filters."
                : "No problems available. Please check back later."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-100 hover:text-black"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {data.problems.map((problem) => {
              const solved = solvedIds.has(problem._id);
              return (
                <li key={problem._id}>
                  <Link
                    href={`/code-editor/${problem.slug}`}
                    className="group flex w-full items-center gap-4 rounded-lg bg-[#0a0a0a] px-4 py-3 font-medium text-white transition duration-200 hover:bg-gray-100 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <StatusCircle solved={solved} />

                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-base sm:text-lg">{problem.title}</span>
                      {/* {problem.topics?.length > 0 && (
                        <span className="mt-0.5 block truncate text-xs font-normal text-gray-500 group-hover:text-gray-600">
                          {problem.topics.slice(0, 4).join(", ")}
                        </span>
                      )} */}
                    </div>

                    <span className={`shrink-0 text-sm sm:text-base ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <hr className="mt-4"></hr>
        {!loading && !error && (
          <Pagination page={page} totalPages={data.totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}

// useSearchParams requires a Suspense boundary in the Next.js App Router.
export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <ProblemsContent />
    </Suspense>
  );
}