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

  const {email,password} = body;
  console.log(email,password);


  const user = await userModel.findOne({email}).select('+password');

    if(!user)
    {
        return new Response(
            JSON.stringify({ message: "Invalid Email or Password" }),
            { status: 401 }
          );
    }

    const validPassword = await userModel.comparePassword(password,user.password);

    if(!validPassword)
    {
        return new Response(
            JSON.stringify({ message: "Invalid Email or Password" }),
            { status: 401 }
          );
    }

    const token = user.generateAuthToken();
    return new Response(
        JSON.stringify({ token,user}),
        { status: 200 }
      );
}