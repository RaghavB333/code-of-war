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
  
    const {id} = body;

    console.log(id);

  const isplayground = await Playground.findOne({id});

  if(isplayground)
  {
    return new Response(
        JSON.stringify({ message:"playground already exist" }),
        { status: 201 }
      );
  }
  
  const playground = new Playground({
    id:id
  });

  await playground.save();

  return new Response(
    JSON.stringify({ playground}),
    { status: 200 }
  );


}


export async function GET(req, res) {

    await connectDB();


  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return new Response(
        JSON.stringify({ errors: errors.array() }),
        { status: 400 }
      );
  }

  const { searchParams } = new URL(req.url);
    const id = (searchParams.get('id'));

    let lobby;
    if(id.includes("@"))
    {
      lobby = await Playground.find({"members.name":id});
      console.log(lobby);
    }
    else{
      lobby = await Playground.findOne({id});
    }



    if(lobby)
    {

        return new Response(
            JSON.stringify({ lobby}),
            { status: 200 }
          );
    }

}