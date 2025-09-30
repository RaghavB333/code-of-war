import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";
const {validationResult} = require('express-validator');



export async function PUT(req) {
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
    if (error) return error; // return 401 if unauthorized


    const body = await req.json();
    const {senderEmail} = body;
    

    await userModel.findByIdAndUpdate(
            user._id,
            {
              $pull: {
                notifications: { senderEmail: senderEmail },
              },
            }
          );
        

    return new Response(
        JSON.stringify({ message: "Request deny"}),
        { status: 200 }
      );
}