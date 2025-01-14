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
  
    const {senderEmail, receiverEmail} = body;
    console.log(senderEmail,receiverEmail);

    const receiver = await userModel.findOne({email: receiverEmail});
    const sender = await userModel.findOne({email: senderEmail});

    receiver.friends.push(senderEmail);
    await receiver.save();

    sender.friends.push(receiverEmail);
    await sender.save();

    await userModel.updateOne(
        { email: receiverEmail },
        {
          $pull: {
            notifications: { senderEmail: senderEmail },
          },
        }
      );

    return new Response(
        JSON.stringify({message: "request accepted"}),
        { status: 200 }
      );
}