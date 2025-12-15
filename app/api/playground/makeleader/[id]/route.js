import connectDB from "@/lib/mongoose";
import playground from "@/models/playground";
import userModel from "@/models/user.model";
import { authUser } from "@/app/middlewares/auth.middleware";

export async function PUT(req, { params }) {
  // Connect to the database
  await connectDB();

  const { user, error } = await authUser(req);
    if (error) return error;

  const { id } = await params; // Extract `id` from `params`
  console.log("id :", id); 

  const body = await req.json();

  const {selectedMember} = body;
  console.log(selectedMember);

  const isuser = await userModel.findById(selectedMember);

  if(!isuser){
    return new Response(
        JSON.stringify({message :"User not found" }),
        { status: 404 }
    )
  }

  const lobby = await playground.findByIdAndUpdate(
    id,
    { $set: { owner: isuser.email } },
    { new: true }   // returns updated document
  );

  if(lobby)
  {
    return new Response(
        JSON.stringify({message:"Leader Changed"}),

        { status: 200 }
    )
  }

  return new Response(
        JSON.stringify({id:"" }),

        { status: 404 }
    )

}