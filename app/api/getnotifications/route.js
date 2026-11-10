import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";

export async function GET(req, res) {
  // Connect to the database
  await connectDB();
  const { user, error } = await authUser(req);
  if (error) return error;
  // const userId = user._id;
  // const user = await userModel.findById(userId);


  const notifications = (user.notifications || [])
  .filter((n) => n.status === 'pending')
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // const notifications = user.notifications;

  if(notifications)
  {
    return new Response(
        JSON.stringify({notifications}),
        { status: 200 }
      );
  }
  else
  {
    return new Response(
        JSON.stringify({ message: "No notifications"}),
        { status: 400 }
      );
  }

}