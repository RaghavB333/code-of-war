import connectDB from "@/lib/mongoose";
import playground from "@/models/playground";
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

  const lobby = await playground.findByIdAndUpdate(
  id,
  {
    $pull: {
      members: { member: selectedMember }
    }
  },
  { new: true }
);

  if(lobby)
  {
    return new Response(
        JSON.stringify({message:"Removed"}),
        { status: 200 }
    )
  }

  return new Response(
        JSON.stringify({message:"Server Error" }),
        { status: 404 }
    )

}