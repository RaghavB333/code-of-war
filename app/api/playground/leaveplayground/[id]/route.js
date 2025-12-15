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
  let lobby = await playground.findById(id);

  if(!isuser){
    return new Response(
        JSON.stringify({message :"User not found" }),
        { status: 404 }
    )
  }



    if(isuser.email == lobby.owner){
       const newLeaderObj = lobby.members.find((m) => m.member._id.toString() !== isuser._id.toString());
        console.log("new leader :", newLeaderObj);
        if(newLeaderObj){
            const newLeader = await userModel.findById(newLeaderObj.member._id);
            lobby = await playground.findByIdAndUpdate(
                id,
                {
                $set: { owner: newLeader.email },
                $pull: {
                    members: { member: selectedMember }
                },
                
                },
                { new: true }
            );
        }else{
            lobby = await playground.findByIdAndUpdate(
                id,
                {
                $pull: {
                    members: { member: selectedMember }
                },
                
                },
                { new: true }
            );
        }
    }else{
        lobby = await playground.findByIdAndUpdate(
            id,
            {
            $pull: {
                members: { member: selectedMember }
            },
            
            },
            { new: true }
        );
    } 
    

//   const newlobby = await playground.findByIdAndUpdate(
//     id,
//     { $set: { owner: isuser.email } },
//     { new: true }   // returns updated document
//   );

  if(lobby)
  {
    return new Response(
        JSON.stringify({message:"You Leave the Playground"}),

        { status: 200 }
    )
  }

  return new Response(
        JSON.stringify({message:"Something went wrong" }),

        { status: 404 }
    )

}