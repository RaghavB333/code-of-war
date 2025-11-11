import Problem from "@/models/problems";
import Playground from "@/models/playground";
import connectDB from "@/lib/mongoose";

export async function GET(req) {
  try {
    // Connect to MongoDB
    const { searchParams } = new URL(req.url, `http://localhost:3000`);
    console.log("searchParams",searchParams)
    
    const lobby = searchParams.get('lobby');
    console.log("Lobby :", lobby);
    await connectDB();


    let problems = [];

    if(lobby)
    {
      const playground = await Playground.findById(lobby);

      // console.log("ply : ", playground);

      const getPrombles = async() => {
        const ply = await Playground.findById(lobby).populate({
          path: 'problemsData.problems',
          select: 'title difficulty'
        });
        console.log("ply data : ", ply.problemsData);
        return ply.problemsData.problems;
      }

      if(playground.problemsData?.problems?.length > 0){
        problems = await getPrombles();
      }
      else if(playground.problemsData?.count){
        const count = playground.problemsData?.count;
        const difficulty = playground.problemsData?.difficulty;
        const ply = await Problem.aggregate([{ $match: { difficulty: difficulty } },{ $sample: { size: count } }]);
        console.log("problems : ", ply);
        ply.forEach((e)=>{
          playground.problemsData.problems.push(e._id);
        })
        playground.save();
        problems = await getPrombles();
      }
    }
    else{
       problems = await Problem.find(); // This returns an array of all problems
    }


    // Fetch all problems from the collection

    // Respond with the fetched problems
    return new Response(JSON.stringify(problems), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch problems" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
