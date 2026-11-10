import User from '@/models/user.model';
import '@/models/problems';               // <- Problem model register होना जरूरी है (populate के लिए). अपना path डालो.
import { authUser } from "@/app/middlewares/auth.middleware";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { user, error } = await authUser(req);
  if (error) return error;

  const limit = Math.min(Math.max(parseInt(new URL(req.url).searchParams.get('limit')) || 5, 1), 20);

  const doc = await User.findById(user._id)
    .select('solvedHistory')
    .populate({ path: 'solvedHistory.problem', select: 'title difficulty slug' })  // <- Problem के field names check करो
    .lean();

  const items = (doc?.solvedHistory || [])
    .filter((h) => h.problem)
    .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
    .slice(0, limit)
    .map((h) => ({
      id: String(h.problem._id),
      title: h.problem.title,
      difficulty: String(h.problem.difficulty || '').toLowerCase(),
      slug: h.problem.slug || null,
      solvedAt: h.solvedAt,
    }));

  return Response.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}