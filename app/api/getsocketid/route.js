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
    console.log("Email:", email);

  const user = await userModel.findOne({email});
  console.log("Friend : ", user);

  if(user.socketId)
  {
    return new Response(
        JSON.stringify({id:user.socketId }),

        { status: 200 }
    )
  }

  return new Response(
        JSON.stringify({id:"" }),

        { status: 404 }
    )

}