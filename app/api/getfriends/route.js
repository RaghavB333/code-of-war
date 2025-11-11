import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";
const {validationResult} = require('express-validator');

export async function GET(req) {
  // Connect to the database
  await connectDB();

  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return new Response(
        JSON.stringify({ errors: errors.array() }),
        { status: 400 }
      );
  }

  const { user, error } = await authUser(req);
  if (error) return error;

  
let friends = [];

if (user.friends && user.friends.length > 0) {
  // Map over friend IDs and fetch users
  friends = await Promise.all(
    user.friends.map(async (friendId) => {
      const friend = await userModel.findById(friendId).select("username email socketId");
      return friend; // only email
    })
  );

  return new Response(
    JSON.stringify({ friends }),
    { status: 200 }
  );
}
  else
  {
    return new Response(
        JSON.stringify({message: "You have not any friend"}),
        {status: 200}
    );
  }
}