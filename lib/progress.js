import User from "@/models/user.model";

// Streak days are calendar days in this timezone (your users are in India).
const STREAK_TIMEZONE = process.env.STREAK_TIMEZONE || "Asia/Kolkata";

const DIFFICULTY_FIELD = {
  "Give Me Story": "easyproblemssolved",
  "Give Me Balanced": "mediumproblemssolved",
  "Give Me Code Of War": "hardproblemssolved",
};

const MAX_RETRIES = 3;

/** "YYYY-MM-DD" for a date, in the streak timezone. */
export const dayKey = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: STREAK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

/** The calendar day before a "YYYY-MM-DD" key. */
export const previousDayKey = (key) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/**
 * The streak to show to the user. A streak is only alive if the last first-solve
 * was today or yesterday; otherwise it has already broken, so show 0.
 * (The stored `streak.current` is reset the next time they solve something new.)
 */
export function effectiveStreak(user, now = new Date()) {
  const last = user?.streak?.lastSubmissionDate;
  if (!last) return 0;
  const lastKey = dayKey(new Date(last));
  const today = dayKey(now);
  return lastKey === today || lastKey === previousDayKey(today) ? user.streak.current ?? 0 : 0;
}

/**
 * Call this after an ACCEPTED submission.
 *
 * Rules
 *  - Only the FIRST accepted solve of a problem counts. Solving the same problem
 *    again (even on another day) changes nothing: no new submission date, no
 *    streak change, no counter change.
 *  - First solve: add to solvedProblems, +1 on the easy/medium/hard counter,
 *    add today's date to submissionDates (once per day), update the streak:
 *      last solve today      -> streak unchanged (at least 1)
 *      last solve yesterday  -> streak + 1
 *      anything older / none -> streak restarts at 1
 *    and max streak = max(max, current).
 *
 * The update is a compare-and-set (it only applies if the problem is still
 * unsolved and the streak date is unchanged), so double submits / parallel
 * requests can never double count. On conflict we re-read and retry.
 */
export async function recordFirstSolve({ userId, problem }) {
  const now = new Date();
  const today = dayKey(now);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const user = await User.findById(userId).select("solvedProblems streak submissionDates").lean();
    if (!user) return null;

    const alreadySolved = (user.solvedProblems ?? []).some((id) => String(id) === String(problem._id));
    if (alreadySolved) {
      return {
        firstSolve: false,
        streak: { current: effectiveStreak(user, now), max: user.streak?.max ?? 0 },
      };
    }

    const lastDate = user.streak?.lastSubmissionDate ?? null;
    const lastKey = lastDate ? dayKey(new Date(lastDate)) : null;

    let current = user.streak?.current ?? 0;
    if (lastKey === today) current = Math.max(current, 1);
    else if (lastKey === previousDayKey(today)) current += 1;
    else current = 1; // streak was broken (or never started) -> starts again from this solve

    const max = Math.max(user.streak?.max ?? 0, current);

    const update = {
      $set: {
        "streak.current": current,
        "streak.max": max,
        "streak.lastSubmissionDate": now,
      },
      $addToSet: {
        submissionDates: today, // once per day
        solvedProblems: problem._id,
      },
    };
    const counter = DIFFICULTY_FIELD[problem.difficulty];
    if (counter) update.$inc = { [counter]: 1 };

    const result = await User.updateOne(
      {
        _id: userId,
        solvedProblems: { $ne: problem._id },
        "streak.lastSubmissionDate": lastDate,
      },
      update
    );

    if (result.modifiedCount === 1) {
      return { firstSolve: true, streak: { current, max } };
    }
    // someone else changed the user document in between -> re-read and retry
  }

  return null;
}