import connectDB from "@/lib/mongoose";
import Playground from "@/models/playground";
import { authUser } from "@/app/middlewares/auth.middleware";
const {validationResult} = require('express-validator');

  export async function POST(req) {
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

    const { user, error } = await authUser(req);
    if (error) return error;

    const body = await req.json();
    
    const {questionCount,difficulty, questions, timeLimit} = body;
    console.log(questionCount,difficulty, questions, timeLimit);

    let problemsData;
    if(!questions){
      problemsData = {
        count: questionCount,
        difficulty
      }
    }

    if(!questionCount && !difficulty){
      problemsData = {
        problems: questions
      }
    }

    const playground = new Playground({
      owner: user.email,
      members: [{ member: user._id, totalPoints: 0 }],
      problemsData,
      sessionend: timeLimit
    });

    await playground.save();

    return new Response(
      JSON.stringify({ playground}),
      { status: 200 }
    );


  }


export async function GET(req) {

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
    console.log("lobbyid : ", id);

  const lobby = await Playground.findById(id)
  .populate({
    path: 'members.member',
    select: 'username email'
  });
    
      // const lobby = await Playground.findById(id);


    if(lobby)
    {

        return new Response(
            JSON.stringify({ lobby}),
            { status: 200 }
          );
    }

}