import connectDB from "@/lib/mongoose";
import playground, { find } from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";

export async function GET(req, { params }) {
  // Connect to the database
  await connectDB();

  const { error } = await authUser(req);
    if (error) return error;

  const { id } = await params; // Extract `id` from `params`
  console.log("id :", id); 

  const playgrounds = await playground.find({'members.member': id});
  console.log("playgrounds : ", playgrounds);

    return new Response(
        JSON.stringify({
        playgrounds
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );


}