import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";

export async function GET(req, { params }) {
  // Connect to the database
  await connectDB();

  const { id } = await params; // Extract `id` from `params`
  console.log("id :", id); 


  const user = await userModel.findById(id);
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