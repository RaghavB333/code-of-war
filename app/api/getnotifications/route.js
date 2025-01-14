import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
const {validationResult} = require('express-validator');

export async function POST(req, res) {
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

  const body = await req.json();
  
    const {email} = body;

  const user = await userModel.findOne({email});

  const notifications = user.notifications;

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
        JSON.stringify({ message: "Not any notifications"}),
        { status: 400 }
      );
  }

}