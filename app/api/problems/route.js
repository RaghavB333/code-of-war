import Problem from "@/models/problems";
import connectDB from "@/lib/mongoose";

export async function GET(req) {
  try {
    // Connect to MongoDB
    const { searchParams } = new URL(req.url, `http://localhost:3000`);
    console.log("searchParams",searchParams)
    
    let difficulty = searchParams.get('difficulty');
    const no = parseInt(searchParams.get('no'));
    console.log("Request URL:", difficulty,no);
    await connectDB();


     let problems = [];
     console.log(difficulty,no);
    if(difficulty && no)
    {
      console.log("Difficulty:", difficulty,no);
      const count = parseInt(no);

      if(difficulty === "Give Me Story")
      {
        difficulty = "easy";
      }
  
      const query = difficulty
        ? { difficulty }
        : {}; // if difficulty is not provided, return all
        problems = await Problem.find(query).limit(count);
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
