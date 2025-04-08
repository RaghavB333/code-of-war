import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
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
  
  const {member,id} = body;
  console.log(member);

  const isplayground = await Playground.findOne({id});

  if(isplayground)
  {
    // isplayground.members.push(member);

  const newMembers = Array.isArray(member) ? member : [member];

  // Filter out existing members
  const uniqueMembers = newMembers.filter(m => !isplayground.members.includes(m));

  // Push only new unique members
  isplayground.members.push(...uniqueMembers);
    isplayground.save();
    return new Response(
        JSON.stringify({message:"member added"}),
        {status:200}
    )
  }
}