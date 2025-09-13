import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
import blacklistTokenModel from "@/models/blacklistToken.model";
const jwt = require('jsonwebtoken');
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

      const cookieHeader = req.headers.get("cookie");
      const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
    console.log("token : ",token);
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
    
    
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);

    if(user){

            return new Response(
                JSON.stringify({user}),
                { status: 200 }
              );
        }

} catch (err) {
    if (err.name === "TokenExpiredError") {
      return new Response(
                JSON.stringify({ message: "Token expired. Please log in again." }),
                { status: 401 }
              );
    } else if (err.name === "JsonWebTokenError") {
        return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401 }
              );
    } else {
        console.error("JWT error:", err);
        return new Response(
                JSON.stringify({ message: "Internal server error" }),
                { status: 500 }
              );
    }
}
        // const decoded = jwt.verify(token,process.env.JWT_SECRET);
        // console.log("decoded",decoded);
        // const user = await userModel.findById(decoded._id);
        // console.log(user);
        // if(user){

        //     return new Response(
        //         JSON.stringify({user}),
        //         { status: 200 }
        //       );
        // }

        return new Response(
            JSON.stringify({ message: 'Unauthorized'}),
            { status: 400 }
          );


}