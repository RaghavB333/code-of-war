import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import blacklistTokenModel from "@/models/blacklistToken.model";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
  
    const {token} = body;
  console.log("token",token)
    if(!token)
    {
        return new Response(
            JSON.stringify({ message: 'Unauthorized'}),
            { status: 400 }
          );
    }

    const isblacklisted = await blacklistTokenModel.findOne({token: token});

    if(isblacklisted)
    {
        return new Response(
            JSON.stringify({ message: 'Unauthorized'}),
            { status: 400 }
          );
    }     

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log("decoded",decoded);
        const user = await userModel.findById(decoded._id);
        console.log(user);
        if(user){

            return new Response(
                JSON.stringify({user}),
                { status: 200 }
              );
        }

        return new Response(
            JSON.stringify({ message: 'Unauthorized'}),
            { status: 400 }
          );


}