import Problem from "@/models/problems";
import Playground from "@/models/playground";
import User from "@/models/user.model"; // adjust the path to your User model
import connectDB from "@/lib/mongoose";

const DIFFICULTIES = ["Give Me Story", "Give Me Balanced", "Give Me Code Of War"];
const MAX_LIMIT = 50;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost:3000");
    const lobby = searchParams.get("lobby");
    const userId = searchParams.get("userId"); // Get userId from query parameters
    await connectDB();

    /* ---------- Lobby mode (unchanged behaviour: returns an array) ---------- */
    if (lobby) {
      const playground = await Playground.findById(lobby);
      if (!playground) return json({ error: "Lobby not found" }, 404);

      const getProblems = async () => {
        const ply = await Playground.findById(lobby).populate({
          path: "problemsData.problems",
          select: "title difficulty",
        });
        return ply.problemsData.problems;
      };

      let problems = [];
      if (playground.problemsData?.problems?.length > 0) {
        problems = await getProblems();
      } else if (playground.problemsData?.count) {
        const { count, difficulty } = playground.problemsData;
        const sampled = await Problem.aggregate([
          { $match: { difficulty } },
          { $sample: { size: count } },
        ]);
        sampled.forEach((e) => playground.problemsData.problems.push(e._id));
        await playground.save();
        problems = await getProblems();
      }
      return json(problems);
    }

    /* ---------- Browse mode: search + filters + pagination ---------- */
    const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
    const topic = (searchParams.get("topic") ?? "").trim();
    const difficulty = searchParams.get("difficulty") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") ?? "15", 10) || 15)
    );

    // NOTE: only published problems are listed. Remove this line if your
    // existing problems were saved with the default "draft" visibility.
    const baseFilter = { visibility: "published" };

    const filter = { ...baseFilter };
    if (DIFFICULTIES.includes(difficulty)) filter.difficulty = difficulty;
    if (topic) filter.topics = topic;
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

    const [problems, total, topics] = await Promise.all([
      Problem.find(filter)
        .select("title slug difficulty topics")
        .sort({ createdAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Problem.countDocuments(filter),
      Problem.distinct("topics", baseFilter),
    ]);

    // Solved status comes straight from the user's solvedProblems (kept up to
    // date by lib/progress.js on the first accepted solve of each problem).
    let solvedIds = [];
    if (userId && problems.length) {
      const user = await User.findById(userId).select("solvedProblems").lean();
      const onPage = new Set(problems.map((p) => String(p._id)));
      solvedIds = (user?.solvedProblems ?? []).map(String).filter((id) => onPage.has(id));
    }

    return json({
      problems,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      topics: topics.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      solvedIds,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return json({ error: "Failed to fetch problems" }, 500);
  }
}