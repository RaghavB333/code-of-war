import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import Problem from "@/models/problems";
import { authUser } from "@/app/middlewares/auth.middleware";
import { completePlayground, generateCode } from "@/lib/playground";

const DIFFICULTIES = ["Give Me Story", "Give Me Balanced", "Give Me Code Of War", "mixed"];
const MAX_OPEN_LOBBIES = 3;
const MAX_PROBLEMS = 20;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// POST /api/playgrounds
//   automatic: { mode: "automatic", questionCount, difficulty, timeLimit }
//   manual:    { mode: "manual", questions: [problemId, ...], timeLimit }
// Problems are NOT picked here; the owner's Start button picks them (fair + no race).
export async function POST(req) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    const { mode, questionCount, difficulty, timeLimit, questions } = await req.json().catch(() => ({}));

    const durationMinutes = Number(timeLimit);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 360) {
      return json({ message: "Time limit must be between 5 and 360 minutes." }, 400);
    }

    await connectDB();

    // finish this owner's games whose time is up, so they don't count as "open"
    const due = await Playground.find({ owner: userId, status: "active", endsAt: { $lte: new Date() } })
      .select("_id")
      .lean();
    for (const { _id } of due) await completePlayground(_id);

    const open = await Playground.countDocuments({ owner: userId, status: { $in: ["waiting", "active"] } });
    if (open >= MAX_OPEN_LOBBIES) {
      return json({ message: `You already have ${MAX_OPEN_LOBBIES} open lobbies. Finish or cancel one first.` }, 429);
    }

    const settings = { durationMinutes };
    const selection = { mode, problemIds: [] };

    if (mode === "manual") {
      const ids = Array.isArray(questions) ? [...new Set(questions.map(String))] : [];
      if (ids.length < 1 || ids.length > MAX_PROBLEMS || !ids.every((id) => mongoose.isValidObjectId(id))) {
        return json({ message: `Pick between 1 and ${MAX_PROBLEMS} questions.` }, 400);
      }
      const found = await Problem.countDocuments({ _id: { $in: ids }, visibility: "published" });
      if (found !== ids.length) return json({ message: "Some selected questions are not available." }, 400);

      selection.problemIds = ids;
      settings.problemCount = ids.length;
    } else if (mode === "automatic") {
      const count = Number(questionCount);
      if (!Number.isInteger(count) || count < 1 || count > MAX_PROBLEMS) {
        return json({ message: `Number of questions must be between 1 and ${MAX_PROBLEMS}.` }, 400);
      }
      if (!DIFFICULTIES.includes(difficulty)) return json({ message: "Invalid difficulty." }, 400);

      settings.problemCount = count;
      settings.difficulty = difficulty;
    } else {
      return json({ message: "Invalid mode." }, 400);
    }

    // The join code is unique; retry in the (very unlikely) case of a clash.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const playground = await Playground.create({
          owner: userId,
          code: generateCode(),
          settings,
          selection,
          members: [{ user: userId, role: "owner", status: "joined", joinedAt: new Date() }],
        });
        return json({ playground: { _id: String(playground._id), code: playground.code } }, 201);
      } catch (error) {
        if (error?.code !== 11000) throw error;
      }
    }
    return json({ message: "Couldn't generate a lobby code. Please try again." }, 500);
  } catch (error) {
    console.error("Create playground failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}