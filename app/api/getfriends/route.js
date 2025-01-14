import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import { response } from "express";
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

  if(user.friends)
  {
    const friends = user.friends;
    return new Response(
        JSON.stringify({friends}),
        {status: 200}
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