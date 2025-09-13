import connectDB from "@/lib/mongoose";

export async function GET(req) {
  // Connect to the database
  await connectDB();

    return new Response(
    JSON.stringify({ success: true, message: "Logged out successfully" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // overwrite the cookie with empty value and expire it immediately
        "Set-Cookie": `token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      },
    }
  );

}