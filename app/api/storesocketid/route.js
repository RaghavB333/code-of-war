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
  
    const {email,socketid} = body;

    const isupdate = await userModel.updateOne(
        { email }, // Filter to find the document (e.g., find user with this email)
        { $set: { socketId: socketid } } // Update operation (setting `socketId` to null)
      );

      if(isupdate)
      {
        return new Response(
            JSON.stringify({message:"updated"}),
            {status: 200}
        )
      }

      return new Response(
        JSON.stringify({ message:"not updated"}),
        { status: 400 }
      );
}