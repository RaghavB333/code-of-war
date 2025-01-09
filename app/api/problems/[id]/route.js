import connectDB from "@/lib/mongoose";
import Problem from "@/models/problems";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch the problem by ID using Mongoose
    const problem = await Problem.findById(id);

    if (!problem) {
      return new Response(JSON.stringify({ error: "Problem not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(problem), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch problem" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
