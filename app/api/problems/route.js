import Problem from "@/models/problems";
import connectDB from "@/lib/mongoose";

export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch all problems from the collection
    const problems = await Problem.find(); // This returns an array of all problems

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
