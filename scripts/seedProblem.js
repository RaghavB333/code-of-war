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
        problemId: "sum_two_numbers",
        title: "Sum of Two Numbers",
        description: "Given two integers, return their sum.",
        difficulty: "easy",
        functionSignature: "def sum_two_numbers(a: int, b: int) -> int:",
        predefinedCode: {
          python: "def sum_two_numbers(a: int, b: int) -> int:\n    # Write your code here\n    pass",
          javascript: "function sumTwoNumbers(a, b) {\n    // Write your code here\n    return 0;\n}",
          java: "public int sumTwoNumbers(int a, int b) {\n    // Write your code here\n    return 0;\n}",
          cpp: "int sumTwoNumbers(int a, int b) {\n    // Write your code here\n    return 0;\n}"
        },
        examples: [
          { input: "a = 1, b = 2", output: "3" },
          { input: "a = 5, b = 10", output: "15" }
        ],
        testCases: [
          { inputs: { a: 1, b: 2 }, expectedOutput: 3 },
          { inputs: { a: 5, b: 10 }, expectedOutput: 15 }
        ]
      },
      {
        problemId: "reverse_string",
        title: "Reverse a String",
        description: "Given a string, return its reverse.",
        difficulty: "easy",
        functionSignature: "def reverse_string(s: str) -> str:",
        predefinedCode: {
          python: "def reverse_string(s: str) -> str:\n    # Write your code here\n    pass",
          javascript: "function reverseString(s) {\n    // Write your code here\n    return '';\n}",
          java: "public String reverseString(String s) {\n    // Write your code here\n    return \"\";\n}",
          cpp: "std::string reverseString(std::string s) {\n    // Write your code here\n    return \"\";\n}"
        },
        examples: [
          { input: "s = 'hello'", output: "'olleh'" },
          { input: "s = 'world'", output: "'dlrow'" }
        ],
        testCases: [
          { inputs: { s: "hello" }, expectedOutput: "olleh" },
          { inputs: { s: "world" }, expectedOutput: "dlrow" }
        ]
      },
      {
        problemId: "find_largest_element",
        title: "Find Largest Element",
        description: "Given an array of integers, return the largest element.",
        difficulty: "medium",
        functionSignature: "def find_largest(nums: List[int]) -> int:",
        predefinedCode: {
          python: "def find_largest(nums: List[int]) -> int:\n    # Write your code here\n    pass",
          javascript: "function findLargest(nums) {\n    // Write your code here\n    return 0;\n}",
          java: "public int findLargest(int[] nums) {\n    // Write your code here\n    return 0;\n}",
          cpp: "int findLargest(std::vector<int> nums) {\n    // Write your code here\n    return 0;\n}"
        },
        examples: [
          { input: "nums = [1, 3, 2, 5, 4]", output: "5" },
          { input: "nums = [10, 20, 30]", output: "30" }
        ],
        testCases: [
          { inputs: { nums: [1, 3, 2, 5, 4] }, expectedOutput: 5 },
          { inputs: { nums: [10, 20, 30] }, expectedOutput: 30 }
        ]
      },
      {
        problemId: "is_palindrome",
        title: "Check Palindrome",
        description: "Given a string, check if it is a palindrome.",
        difficulty: "medium",
        functionSignature: "def is_palindrome(s: str) -> bool:",
        predefinedCode: {
          python: "def is_palindrome(s: str) -> bool:\n    # Write your code here\n    pass",
          javascript: "function isPalindrome(s) {\n    // Write your code here\n    return false;\n}",
          java: "public boolean isPalindrome(String s) {\n    // Write your code here\n    return false;\n}",
          cpp: "bool isPalindrome(std::string s) {\n    // Write your code here\n    return false;\n}"
        },
        examples: [
          { input: "s = 'madam'", output: "true" },
          { input: "s = 'hello'", output: "false" }
        ],
        testCases: [
          { inputs: { s: "madam" }, expectedOutput: true },
          { inputs: { s: "hello" }, expectedOutput: false }
        ]
      },
      {
        problemId: "longest_substring",
        title: "Longest Substring Without Repeating Characters",
        description: "Find the length of the longest substring without repeating characters in a given string.",
        difficulty: "hard",
        functionSignature: "def length_of_longest_substring(s: str) -> int:",
        predefinedCode: {
          python: "def length_of_longest_substring(s: str) -> int:\n    # Write your code here\n    pass",
          javascript: "function lengthOfLongestSubstring(s) {\n    // Write your code here\n    return 0;\n}",
          java: "public int lengthOfLongestSubstring(String s) {\n    // Write your code here\n    return 0;\n}",
          cpp: "int lengthOfLongestSubstring(std::string s) {\n    // Write your code here\n    return 0;\n}"
        },
        examples: [
          { input: "s = 'abcabcbb'", output: "3" },
          { input: "s = 'bbbbb'", output: "1" }
        ],
        testCases: [
          { inputs: { s: "abcabcbb" }, expectedOutput: 3 },
          { inputs: { s: "bbbbb" }, expectedOutput: 1 }
        ]
      }
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
