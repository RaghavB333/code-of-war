import connectDB from "@/lib/mongoose";
import mongoose from "mongoose";
import Problem from "@/models/problems";

export async function GET(req, { params }) {
  // Connect to the database
  await connectDB();

  const { id } = params; // Extract `id` from `params`

  // Check if the `id` is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(
      JSON.stringify({ error: "Invalid ObjectId" }),
      { status: 400 }
    );
  }

  try {
    // Query the database for the problem by its ID
    const problem = await Problem.findById(id).lean();

    if (!problem) {
      return new Response(
        JSON.stringify({ message: "Problem not found" }),
        { status: 404 }
      );
    }

    // Return the problem data as JSON
    return new Response(JSON.stringify(problem), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching problem:", error);

    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
