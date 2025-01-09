require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Problem = require('../models/problems'); // Adjust path as needed


const seedProblems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    // Sample problems
    const problems = [
      {
        title: "Sum of Two Numbers",
        description: "Given two integers, return their sum.",
        difficulty: "Easy",
        testCases: [
          { input: "[1, 2]", expectedOutput: "3", explanation: "Adding 1 and 2 gives 3." },
          { input: "[5, 10]", expectedOutput: "15", explanation: "Adding 5 and 10 gives 15." },
        ],
      },
      {
        title: "Reverse a String",
        description: "Given a string, return its reverse.",
        difficulty: "Easy",
        testCases: [
          { input: '"hello"', expectedOutput: '"olleh"', explanation: "Reversing 'hello' gives 'olleh'." },
          { input: '"world"', expectedOutput: '"dlrow"', explanation: "Reversing 'world' gives 'dlrow'." },
        ],
      },
      {
        title: "Find Largest Element",
        description: "Given an array of integers, return the largest element.",
        difficulty: "Medium",
        testCases: [
          { input: "[1, 3, 2, 5, 4]", expectedOutput: "5", explanation: "The largest element is 5." },
          { input: "[10, 20, 30]", expectedOutput: "30", explanation: "The largest element is 30." },
        ],
      },
      {
        title: "Check Palindrome",
        description: "Given a string, check if it is a palindrome.",
        difficulty: "Medium",
        testCases: [
          { input: '"madam"', expectedOutput: "true", explanation: "'madam' reads the same backward and forward." },
          { input: '"hello"', expectedOutput: "false", explanation: "'hello' is not a palindrome." },
        ],
      },
      {
        title: "Solve Sudoku",
        description: "Given a partially filled 9x9 Sudoku grid, fill it completely.",
        difficulty: "Hard",
        testCases: [
          { 
            input: "[[5, 3, 0, 0, 7, 0, 0, 0, 0], [...]]", 
            expectedOutput: "[[5, 3, 4, 6, 7, 8, 9, 1, 2], [...]]", 
            explanation: "Complete the Sudoku grid based on its rules." 
          },
        ],
      },
    ];

    // Clear existing problems
    await Problem.deleteMany();
    console.log("Cleared existing problems");

    // Insert sample problems
    await Problem.insertMany(problems);
    console.log("Sample problems added successfully");

    // Close the database connection
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.connection.close();
  }
};

// Run the seed script
seedProblems();
