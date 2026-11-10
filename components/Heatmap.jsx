"use client"

import React, { useContext, useMemo, useState } from 'react';
import { UserDataContext } from '@/context/UserContext';
import { ChevronDown } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LEVELS = ['#262626', '#166534', '#16a34a', '#22c55e', '#4ade80'];

const key = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Build month blocks. Each block = columns (weeks) x 7 rows (Sun..Sat).
function buildMonths(start, end) {
  const blocks = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const offset = new Date(y, m, 1).getDay();
    const cols = [];
    for (let i = 0; i < offset + daysInMonth; i++) {
      const col = Math.floor(i / 7);
      if (!cols[col]) cols[col] = Array(7).fill(null);
      const day = i - offset + 1;
      if (day >= 1) {
        const date = new Date(y, m, day);
        if (date >= start && date <= end) cols[col][i % 7] = date;
      }
    }
    blocks.push({ label: MONTHS[m], year: y, cols });
    cur.setMonth(m + 1);
  }
  return blocks;
}

const Heatmap = () => {
  const { user } = useContext(UserDataContext);
  const [view, setView] = useState('current');
  const thisYear = new Date().getFullYear();

  const counts = useMemo(() => {
    const map = {};
    (user?.submissionDates || []).forEach((d) => { map[d] = (map[d] || 0) + 1; });
    return map;
  }, [user?.submissionDates]);

  const { blocks, total, activeDays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start, end;
    if (view === 'current') {
      end = today;
      start = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1);
    } else {
      start = new Date(Number(view), 0, 1);
      end = new Date(Number(view), 11, 31);
    }
    const blocks = buildMonths(start, end);
    let total = 0, activeDays = 0;
    blocks.forEach((b) => b.cols.forEach((c) => c.forEach((d) => {
      if (d && counts[key(d)]) { total += counts[key(d)]; activeDays++; }
    })));
    return { blocks, total, activeDays };
  }, [view, counts]);

  const level = (n) => (!n ? 0 : n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : 1);

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#141414] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="text-2xl font-semibold text-white">{total}</span>
          <span>submissions in {view === 'current' ? 'the past one year' : view}</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-neutral-400">
          <span>Total active days: <b className="text-neutral-200">{activeDays}</b></span>
          <span>Max streak: <b className="text-neutral-200">{user?.streak?.max ?? 0}</b></span>
          <div className="relative">
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg bg-neutral-800 py-2 pl-4 pr-9 text-sm text-neutral-200 outline-none hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <option value="current">Current</option>
              {[thisYear, thisYear - 1, thisYear - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 [scrollbar-width:thin]
        [scrollbar-color:#404040_#171717]
        [&::-webkit-scrollbar]:h-1.5
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-track]:bg-neutral-900
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-neutral-700
        [&::-webkit-scrollbar-thumb:hover]:bg-neutral-600">
        <div className="flex min-w-max justify-between gap-3">
          {blocks.map((b) => (
            <div key={`${b.label}-${b.year}`} className="flex flex-col items-center gap-3">
              <div className="flex gap-[3px]">
                {b.cols.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-[3px]">
                    {col.map((date, ri) => {
                      if (!date) return <div key={ri} className="h-3 w-3" />;
                      const n = counts[key(date)] || 0;
                      return (
                        <div
                          key={ri}
                          title={`${n} submission${n === 1 ? '' : 's'} on ${date.toDateString()}`}
                          className="h-3 w-3 rounded-[3px]"
                          style={{ backgroundColor: LEVELS[level(n)] }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="text-sm text-neutral-400">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

