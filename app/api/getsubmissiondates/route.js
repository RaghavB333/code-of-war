import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";

export async function GET(request) {
  // Connect to the database
  await connectDB();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  console.log("get-subimission-dates : ",username);

  const isuser = await userModel.findOne({email:username});
  console.log("isuser : ",isuser);
  if(isuser)
  {
    const submissionDates = isuser.submissionDates || [];
    console.log("submission-dates : ", submissionDates);
    return new Response(
        JSON.stringify({ submissionDates}),
        { status: 201 }
      );
  }
  else{
    return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
  }
}