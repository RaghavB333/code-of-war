import connectDB from '../../../lib/mongoose'; // Utility to connect to DB
import Submissions from '../../../models/submissions'; // Import Submission model

// Handle GET requests to fetch submissions with pagination
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Fetch submissions with pagination
    const submissions = await Submissions.find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get the total count of documents
    const total = await Submissions.countDocuments();

    return new Response(
      JSON.stringify({ submissions, total, page, limit }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new Response(
      JSON.stringify({
        message: 'Error fetching submissions',
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle POST requests to create a new submission
export async function POST(request) {
  try {
    await connectDB();

    // Parse the incoming JSON request body
    const { code, language, results } = await request.json();

    // Create a new submission
    const newSubmission = new Submissions({
      code,
      language,
      results,
      timestamp: new Date().toISOString(),
    });

    // Save the new submission to the database
    await newSubmission.save();

    return new Response(
      JSON.stringify({
        message: 'Submission saved successfully!',
        submission: newSubmission,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving submission:', error);
    return new Response(
      JSON.stringify({
        message: 'Error saving submission',
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
