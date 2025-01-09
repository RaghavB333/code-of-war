import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const client = await clientPromise;
    const db = client.db("codeofwar");

    // Fetch the problem by ID
    const problem = await db.collection("problems").findOne({ _id: new ObjectId(id) });

    if (!problem) {
      return new Response(JSON.stringify({ error: "Problem not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(problem), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch problem" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
