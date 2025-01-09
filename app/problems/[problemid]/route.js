// app/api/problems/[problemId]/route.js

import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  const { problemId } = params;
  const client = await clientPromise;
  const db = client.db("codeofwar");

  try {
    const problem = await db.collection("problems").findOne({ _id: new ObjectId(problemId) });
    if (!problem) {
      return new Response("Problem not found", { status: 404 });
    }
    return new Response(JSON.stringify(problem), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching problem", { status: 500 });
  }
}
