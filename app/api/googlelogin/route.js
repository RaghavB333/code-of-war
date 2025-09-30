import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";

export async function POST(req) {
    // Connect to the database
    await connectDB();
        const body = await req.json();
    const { username, email} = body;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        username,
        email,
        authProvider: "google", // <-- new field
      });
    } else if (user.authProvider !== "google") {
    return new Response(
      JSON.stringify({ message: "Email already registered with credentials login" }),
      { status: 400 }
    );
  }

        const token = user.generateAuthToken();
    
    return new Response(
    JSON.stringify({ success: true, token, user }),
    {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    }
  }
);
}