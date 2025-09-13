import connectDB from "../../../lib/mongoose"; // Utility to connect to DB
import Submissions from "../../../models/submissions";
import userModel from "@/models/user.model";
import Problem from "@/models/problems"; // Import Submission model
import playground from "@/models/playground"; // Import Playground model

// Handle GET requests to fetch submissions with pagination
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Fetch submissions with pagination
    const submissions = await Submissions.find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get the total count of documents
    const total = await Submissions.countDocuments();

    return new Response(JSON.stringify({ submissions, total, page, limit }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching submissions",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle POST requests to create a new submission
export async function POST(request) {
  try {
    await connectDB();

    // Parse the incoming JSON request body
    const { username, problemId, code, language, results, islobby } =
      await request.json();
    console.log(username, problemId, code, language, results);

    const problem = await Problem.findOne({ _id: problemId });

    console.log(problem);

    if (!problem) {
      return new Response(JSON.stringify({ message: "Problem not found" }), {
        status: 400,
      });
    }
    const difficulty = problem.difficulty;

    const isexist = await Submissions.findOne({
      username: username,
      problemId: problemId,
      "results.allPassed": true,
    });

    console.log("isexist: ", isexist);

    if (!isexist) {
      if (difficulty === "easy") {
        if (islobby) {
          await playground.updateOne(
            { id: islobby, "members.name": username },
            { $set: { "members.$.totalPoints": 50 } }
          );
        }
        await userModel.updateOne(
          { email: username },
          { $inc: { easyproblemssolved: 1 } }
        );
      } else if (difficulty === "medium") {
        if (islobby) {
          await playground.updateOne(
            { id: islobby, "members.name": username },
            { $set: { "members.$.totalPoints": 100 } }
          );
        }
        await userModel.updateOne(
          { email: username },
          { $inc: { mediumproblemssolved: 1 } }
        );
      } else {
        if (islobby) {
          await playground.updateOne(
            { id: islobby, "members.name": username },
            { $set: { "members.$.totalPoints": 200 } }
          );
        }
        await userModel.updateOne(
          { email: username },
          { $inc: { hardproblemssolved: 1 } }
        );
      }

      // const user = await userModel.findOne({ email: username });

      //     const today = new Date();
      //     const yesterday = new Date();
      //     yesterday.setDate(today.getDate() - 1);

      //     // Normalize dates to compare only the date part
      //     const lastDate = user.streak.lastSubmissionDate
      //       ? new Date(user.streak.lastSubmissionDate.toDateString())
      //       : null;

      //     const todayDate = new Date(today.toDateString());

      //     if (!lastDate || lastDate < yesterday) {
      //       // Missed a day or first time
      //       user.streak.current = 1;
      //     } else if (lastDate.getTime() === yesterday.getTime()) {
      //       // Continued streak
      //       user.streak.current += 1;
      //     }

      //     // Update max streak
      //     user.streak.max = Math.max(user.streak.max, user.streak.current);

      //     // Update last submission date
      //     user.streak.lastSubmissionDate = today;

      //     const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      //     if (!user.submissionDates.includes(todayStr)) {
      //       user.submissionDates.push(todayStr);
      //     }
      //     await user.save();

      const user = await userModel.findOne({ email: username });

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today at 00:00
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1); // yesterday at 00:00

// Last submission date normalized to start of the day
const lastDate = user.streak.lastSubmissionDate
  ? new Date(user.streak.lastSubmissionDate.getFullYear(), user.streak.lastSubmissionDate.getMonth(), user.streak.lastSubmissionDate.getDate())
  : null;

if (!lastDate || lastDate < yesterday) {
  // Missed a day or first submission
  user.streak.current = 1;
} else if (lastDate.getTime() === yesterday.getTime()) {
  // Submitted yesterday → streak continues
  user.streak.current += 1;
}

// Update max streak
user.streak.max = Math.max(user.streak.max, user.streak.current);

// Update last submission date to now
user.streak.lastSubmissionDate = now;

// Save today's date as string "YYYY-MM-DD"
const todayStr = now.toISOString().split("T")[0];
if (!user.submissionDates.includes(todayStr)) {
  user.submissionDates.push(todayStr);
}

await user.save();

    } else {
      if (difficulty === "easy" && islobby) {
        await playground.updateOne(
          { id: islobby, "members.name": username },
          { $inc: { "members.$.totalPoints": 50 } }
        );
      } else if (difficulty === "medium" && islobby) {
        await playground.updateOne(
          { id: islobby, "members.name": username },
          { $inc: { "members.$.totalPoints": 100 } }
        );
      } else if (difficulty === "hard" && islobby) {
        await playground.updateOne(
          { id: islobby, "members.name": username },
          { $inc: { "members.$.totalPoints": 200 } }
        );
      }
    }

    // Create a new submission
    const newSubmission = new Submissions({
      username,
      code,
      language,
      results,
      timestamp: new Date().toISOString(),
      problemId,
    });

    // Save the new submission to the database
    await newSubmission.save();

    return new Response(
      JSON.stringify({
        message: "Submission saved successfully!",
        submission: newSubmission,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving submission:", error);
    return new Response(
      JSON.stringify({
        message: "Error saving submission",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
