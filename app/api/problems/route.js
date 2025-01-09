import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("codeofwar");
    
    // Fetch all problems from the database
    const problems = await db.collection("problems").find().toArray();
    console.log("Problems fetched from database:", problems);  // Debugging log

    
    return new Response(JSON.stringify(problems), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch problems" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
