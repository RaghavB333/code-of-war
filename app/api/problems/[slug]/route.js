// import connectDB from "@/lib/mongoose";
// import Problem from "@/models/problems";

// export async function GET(req, { params }) {
//   // Connect to the database
//   await connectDB();
//   const { slug } = await params; // Extract `id` from `params`
//   console.log(slug);

//   try {
//     // Query the database for the problem by its ID
//     const problem = await Problem.findOne({slug}).lean();
//     console.log("fetch problme : ", problem);

//     if (!problem) {
//       return new Response(
//         JSON.stringify({ message: "Problem not found" }),
//         { status: 404 }
//       );
//     }


//     // Ensure that problem data is structured as expected
//     const formattedProblem = {
//       problemId: problem.problemId,
//       title: problem.title,
//       description: problem.description,
//       difficulty: problem.difficulty,
//       functionSignature: problem.functionSignature,
//       predefinedCode: problem.predefinedCode,
//       examples: problem.examples,
//       testCases: problem.testCases,
//       languageWrappers:problem.languageWrappers,
//     };

//     // Return the problem data as JSON
//     return new Response(JSON.stringify(formattedProblem), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching problem:", error);

//     return new Response(
//       JSON.stringify({ message: "Internal server error" }),
//       { status: 500 }
//     );
//   }
// }

import connectDB from "@/lib/mongoose";
import Problem from "@/models/problems";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    // NOTE: only published problems are served. Remove `visibility` if your
    // problems are still saved as "draft".
    const problem = await Problem.findOne({
      slug: String(slug).toLowerCase(),
      visibility: "published",
    }).lean();

    if (!problem) return json({ message: "Problem not found" }, 404);

    const testCases = problem.testCases ?? [];

    // Only public (isHidden === false) cases are ever sent, and only their
    // inputs. Expected outputs and hidden cases never leave the server.
    const publicTestCases = testCases
      .filter((tc) => tc.isHidden === false)
      .map((tc) => ({ inputs: tc.inputs }));

    return json({
      _id: String(problem._id),
      problemId: problem.problemId,
      slug: problem.slug,
      title: problem.title,
      description: problem.description,
      contentFormat: problem.contentFormat,
      images: problem.images ?? [],
      difficulty: problem.difficulty,
      topics: problem.topics ?? [],
      tags: problem.tags ?? [],
      constraints: problem.constraints ?? [],
      inputSchema: problem.inputSchema ?? [],
      functionSignature: problem.functionSignature,
      predefinedCode: problem.predefinedCode,
      languageWrappers: problem.languageWrappers,
      examples: problem.examples ?? [],
      limits: {
        timeLimitMs: problem.limits?.timeLimitMs ?? 2000,
        memoryLimitMb: problem.limits?.memoryLimitMb ?? 256,
      },
      stats: problem.stats ?? { acceptedCount: 0, submissionCount: 0 },
      publicTestCases,
      testCaseCount: testCases.length,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return json({ message: "Internal server error" }, 500);
  }
}