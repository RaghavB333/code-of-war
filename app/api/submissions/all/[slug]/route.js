import connectDB from "@/lib/mongoose";
import Problem from "@/models/problems";
import Submission from "@/models/submission";
import { authUser } from "@/app/middlewares/auth.middleware";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// GET /api/problems/:slug/submissions?page=1&limit=20
// Every submission (accepted or not) of the current user for this problem, newest first.
export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    console.log("problem slug.... : ", slug);
    const { searchParams } = new URL(req.url, "http://localhost");

    const { user, error } = await authUser(req);
    if (error) return error;
    if (!user) return json({ message: "Please log in to see your submissions." }, 401);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const skip = (page - 1) * limit;

    await connectDB();

    const problem = await Problem.findOne({ slug: String(slug).toLowerCase() }).select("_id").lean();
    if (!problem) return json({ message: "Problem not found" }, 404);

    const filter = { user: user._id, problem: problem._id };

    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("status language submittedAt execution.timeMs execution.memoryKb execution.passedTests execution.totalTests")
        .lean(),
      Submission.countDocuments(filter),
    ]);

    return json({
      total,
      page,
      hasMore: skip + items.length < total,
      submissions: items.map((s, i) => ({
        id: String(s._id),
        number: total - skip - i, // oldest submission is #1
        status: s.status,
        language: s.language,
        timeMs: s.execution?.timeMs ?? null,
        memoryKb: s.execution?.memoryKb ?? null,
        passedTests: s.execution?.passedTests ?? 0,
        totalTests: s.execution?.totalTests ?? 0,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error listing submissions:", error);
    return json({ message: "Internal server error" }, 500);
  }
}