import connectDB from "@/lib/mongoose";
import User from "@/models/user.model"; // adjust the path to your User model
import { authUser } from "@/app/middlewares/auth.middleware";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// GET /api/friends -> { friends: [{ _id, username, email }] }
export async function GET(req) {
  try {
    const { user, error } = await authUser(req);
    if (error) return error;
    const userId = user._id;
    if (!userId) return json({ message: "Please log in." }, 401);

    await connectDB();
    const fetchedUser = await User.findById(userId)
      .select("friends")
      .populate({ path: "friends", select: "username email", match: { accountStatus: "active" } })
      .lean();

    const friends = (fetchedUser?.friends ?? []).filter(Boolean).map((f) => ({
      _id: String(f._id),
      username: f.username,
      email: f.email,
    }));
    return json({ friends });
  } catch (error) {
    console.error("Get friends failed:", error);
    return json({ message: "Internal server error" }, 500);
  }
}