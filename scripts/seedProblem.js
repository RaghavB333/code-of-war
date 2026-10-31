require('dotenv').config({ path: '.env.local' });
const mongoose = require("mongoose");
const Problem = require("../models/problems");

/*
 * Code of War problem seed.
 * Run from project root: node scripts/seedProblem.js
 *
 * Assumptions:
 * - models/problem.model.js exports the Problem model.
 * - .env contains MONGODB_URI.
 * - The judge wrapper accepts structured inputs and serializes return values
 *   consistently with expectedOutput.
 * - These are starter/public examples and judge test cases, not a complete
 *   production-grade hidden test suite.
 */

const problems = [
  {
    problemId: "CW001",
    slug: "sum-of-two-numbers",
    title: "Sum of Two Numbers",
    description: `## Sum of Two Numbers

Given two integers \`a\` and \`b\`, return their sum.

### Example 1
Input: a = 5, b = 4
Output: 9

### Example 2
Input: a = -3, b = 7
Output: 4`,
    difficulty: "Give Me Story",
    topics: ["Math", "Basic Programming"],
    tags: ["beginner", "arithmetic"],
    constraints: ["-1000000000 <= a, b <= 1000000000"],
    inputSchema: [
      { name: "a", type: "number" },
      { name: "b", type: "number" },
    ],
    functionSignature: "sum(a, b)",
    predefinedCode: {
      javascript: "function sum(a, b) {\n  // Write your code here\n}",
      python: "def sum(a, b):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public long sum(long a, long b) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    long long sum(long long a, long long b) {\n        // Write your code here\n        return 0;\n    }\n};",
    },
    examples: [
      { input: "a = 5, b = 4", output: "9", explanation: "5 + 4 = 9." },
      { input: "a = -3, b = 7", output: "4", explanation: "-3 + 7 = 4." },
    ],
    testCases: [
      { inputs: { a: 5, b: 4 }, expectedOutput: 9, isHidden: false },
      { inputs: { a: -3, b: 7 }, expectedOutput: 4, isHidden: false },
      { inputs: { a: 0, b: 0 }, expectedOutput: 0, isHidden: true },
      { inputs: { a: -10, b: -20 }, expectedOutput: -30, isHidden: true },
      { inputs: { a: 1000000000, b: 1000000000 }, expectedOutput: 2000000000, isHidden: true },
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128, maxOutputSizeKb: 256, wallTimeLimitMs: 3000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW002",
    slug: "reverse-a-string",
    title: "Reverse a String",
    description: `## Reverse a String

Given a string \`s\`, return its characters in reverse order.

### Example 1
Input: s = "hello"
Output: "olleh"

### Example 2
Input: s = "Code"
Output: "edoC"`,
    difficulty: "Give Me Story",
    topics: ["Strings", "Two Pointers"],
    tags: ["string", "beginner"],
    constraints: ["0 <= s.length <= 100000"],
    inputSchema: [{ name: "s", type: "string" }],
    functionSignature: "reverseString(s)",
    predefinedCode: {
      javascript: "function reverseString(s) {\n  // Write your code here\n}",
      python: "def reverseString(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String reverseString(String s) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string reverseString(string s) {\n        // Write your code here\n        return \"\";\n    }\n};",
    },
    examples: [
      { input: 's = "hello"', output: '"olleh"', explanation: "Reverse the characters." },
      { input: 's = "Code"', output: '"edoC"', explanation: "The reversed string is edoC." },
    ],
    testCases: [
      { inputs: { s: "hello" }, expectedOutput: "olleh", isHidden: false },
      { inputs: { s: "Code" }, expectedOutput: "edoC", isHidden: false },
      { inputs: { s: "" }, expectedOutput: "", isHidden: true },
      { inputs: { s: "a" }, expectedOutput: "a", isHidden: true },
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128, maxOutputSizeKb: 256, wallTimeLimitMs: 3000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW003",
    slug: "palindrome-number",
    title: "Palindrome Number",
    description: `## Palindrome Number

Given an integer \`n\`, return \`true\` if it reads the same forward and backward; otherwise return \`false\`. Negative numbers are not palindromes.

### Example 1
Input: n = 121
Output: true

### Example 2
Input: n = -121
Output: false`,
    difficulty: "Give Me Story",
    topics: ["Math", "Strings"],
    tags: ["palindrome", "number"],
    constraints: ["-2147483648 <= n <= 2147483647"],
    inputSchema: [{ name: "n", type: "number" }],
    functionSignature: "isPalindrome(n)",
    predefinedCode: {
      javascript: "function isPalindrome(n) {\n  // Write your code here\n}",
      python: "def isPalindrome(n):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isPalindrome(int n) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(int n) {\n        // Write your code here\n        return false;\n    }\n};",
    },
    examples: [
      { input: "n = 121", output: "true", explanation: "121 reads the same both ways." },
      { input: "n = -121", output: "false", explanation: "Negative numbers are not palindromes." },
    ],
    testCases: [
      { inputs: { n: 121 }, expectedOutput: true, isHidden: false },
      { inputs: { n: -121 }, expectedOutput: false, isHidden: false },
      { inputs: { n: 10 }, expectedOutput: false, isHidden: true },
      { inputs: { n: 0 }, expectedOutput: true, isHidden: true },
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128, maxOutputSizeKb: 256, wallTimeLimitMs: 3000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW004",
    slug: "two-sum",
    title: "Two Sum",
    description: `## Two Sum

Given an integer array \`nums\` and an integer \`target\`, return the indices of two distinct elements whose sum equals target. Exactly one answer exists. Return the smaller index first.

### Example 1
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

### Example 2
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    difficulty: "Give Me Balanced",
    topics: ["Arrays", "Hash Map"],
    tags: ["array", "hashmap", "interview"],
    constraints: ["2 <= nums.length <= 100000", "-1000000000 <= nums[i], target <= 1000000000", "Exactly one valid answer exists."],
    inputSchema: [
      { name: "nums", type: "array" },
      { name: "target", type: "number" },
    ],
    functionSignature: "twoSum(nums, target)",
    predefinedCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n}",
      python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};",
    },
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "2 + 4 = 6." },
    ],
    testCases: [
      { inputs: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], isHidden: false },
      { inputs: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], isHidden: false },
      { inputs: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], isHidden: true },
      { inputs: { nums: [-1, -2, -3, -4, -5], target: -8 }, expectedOutput: [2, 4], isHidden: true },
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW005",
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    description: `## Best Time to Buy and Sell Stock

Given \`prices[i]\`, the stock price on day \`i\`, choose one day to buy and a later day to sell. Return the maximum profit, or \`0\` if no profit is possible.

### Example 1
Input: prices = [7,1,5,3,6,4]
Output: 5

### Example 2
Input: prices = [7,6,4,3,1]
Output: 0`,
    difficulty: "Give Me Balanced",
    topics: ["Arrays", "Greedy"],
    tags: ["optimization", "interview"],
    constraints: ["1 <= prices.length <= 100000", "0 <= prices[i] <= 100000"],
    inputSchema: [{ name: "prices", type: "array" }],
    functionSignature: "maxProfit(prices)",
    predefinedCode: {
      javascript: "function maxProfit(prices) {\n  // Write your code here\n}",
      python: "def maxProfit(prices):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n        return 0;\n    }\n};",
    },
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy at 1 and sell at 6." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No profitable trade is possible." },
    ],
    testCases: [
      { inputs: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, isHidden: false },
      { inputs: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, isHidden: false },
      { inputs: { prices: [2, 4, 1] }, expectedOutput: 2, isHidden: true },
      { inputs: { prices: [1] }, expectedOutput: 0, isHidden: true },
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW006",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: `## Valid Parentheses

Given a string containing only \`()[]{ }\` (without the space inside the braces), determine whether the brackets are valid. Every opening bracket must close with the same type in the correct order.

### Example 1
Input: s = "()[]{}"
Output: true

### Example 2
Input: s = "(]"
Output: false`,
    difficulty: "Give Me Balanced",
    topics: ["Strings", "Stack"],
    tags: ["stack", "brackets"],
    constraints: ["1 <= s.length <= 100000", "s contains only (, ), [, ], { and }."],
    inputSchema: [{ name: "s", type: "string" }],
    functionSignature: "isValid(s)",
    predefinedCode: {
      javascript: "function isValid(s) {\n  // Write your code here\n}",
      python: "def isValid(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};",
    },
    examples: [
      { input: 's = "()[]{}"', output: "true", explanation: "All brackets close correctly." },
      { input: 's = "(]"', output: "false", explanation: "Bracket types do not match." },
    ],
    testCases: [
      { inputs: { s: "()[]{}" }, expectedOutput: true, isHidden: false },
      { inputs: { s: "(]" }, expectedOutput: false, isHidden: false },
      { inputs: { s: "([{}])" }, expectedOutput: true, isHidden: true },
      { inputs: { s: "(((" }, expectedOutput: false, isHidden: true },
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW007",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    description: `## Longest Substring Without Repeating Characters

Given a string \`s\`, return the length of the longest substring without repeating characters.

### Example 1
Input: s = "abcabcbb"
Output: 3

### Example 2
Input: s = "bbbbb"
Output: 1`,
    difficulty: "Give Me Balanced",
    topics: ["Strings", "Hash Map", "Sliding Window"],
    tags: ["sliding-window", "optimization"],
    constraints: ["0 <= s.length <= 50000"],
    inputSchema: [{ name: "s", type: "string" }],
    functionSignature: "lengthOfLongestSubstring(s)",
    predefinedCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n}",
      python: "def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};",
    },
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: '"abc" is a longest valid substring.' },
      { input: 's = "bbbbb"', output: "1", explanation: '"b" is the longest valid substring.' },
    ],
    testCases: [
      { inputs: { s: "abcabcbb" }, expectedOutput: 3, isHidden: false },
      { inputs: { s: "bbbbb" }, expectedOutput: 1, isHidden: false },
      { inputs: { s: "pwwkew" }, expectedOutput: 3, isHidden: true },
      { inputs: { s: "" }, expectedOutput: 0, isHidden: true },
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW008",
    slug: "merge-intervals",
    title: "Merge Intervals",
    description: `## Merge Intervals

Given an array of intervals, merge all overlapping intervals and return the resulting intervals. Intervals that touch at an endpoint are considered overlapping.

### Example 1
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]

### Example 2
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]`,
    difficulty: "Give Me Code Of War",
    topics: ["Arrays", "Sorting"],
    tags: ["intervals", "sorting"],
    constraints: ["1 <= intervals.length <= 100000", "intervals[i].length == 2", "0 <= start <= end <= 100000"],
    inputSchema: [{ name: "intervals", type: "array" }],
    functionSignature: "merge(intervals)",
    predefinedCode: {
      javascript: "function merge(intervals) {\n  // Write your code here\n}",
      python: "def merge(intervals):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your code here\n        return new int[0][];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your code here\n        return {};\n    }\n};",
    },
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "The first two intervals overlap." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals touching at 4 merge." },
    ],
    testCases: [
      { inputs: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expectedOutput: [[1, 6], [8, 10], [15, 18]], isHidden: false },
      { inputs: { intervals: [[1, 4], [4, 5]] }, expectedOutput: [[1, 5]], isHidden: false },
      { inputs: { intervals: [[1, 4]] }, expectedOutput: [[1, 4]], isHidden: true },
      { inputs: { intervals: [[1, 4], [0, 2], [3, 5]] }, expectedOutput: [[0, 5]], isHidden: true },
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW009",
    slug: "number-of-islands",
    title: "Number of Islands",
    description: `## Number of Islands

Given a grid of \`1\` (land) and \`0\` (water), count islands connected horizontally or vertically.

### Example 1
Input: grid = [["1","1","0"],["1","0","0"],["0","0","1"]]
Output: 2

### Example 2
Input: grid = [["0","0"],["0","0"]]
Output: 0`,
    difficulty: "Give Me Code Of War",
    topics: ["Matrix", "Graph", "DFS", "BFS"],
    tags: ["matrix", "graph-traversal"],
    constraints: ["1 <= rows, columns <= 300", "Each cell is either 0 or 1."],
    inputSchema: [{ name: "grid", type: "matrix" }],
    functionSignature: "numIslands(grid)",
    predefinedCode: {
      javascript: "function numIslands(grid) {\n  // Write your code here\n}",
      python: "def numIslands(grid):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};",
    },
    examples: [
      { input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: "2", explanation: "There are two disconnected land groups." },
      { input: 'grid = [["0","0"],["0","0"]]', output: "0", explanation: "There is no land." },
    ],
    testCases: [
      { inputs: { grid: [["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]] }, expectedOutput: 2, isHidden: false },
      { inputs: { grid: [["0", "0"], ["0", "0"]] }, expectedOutput: 0, isHidden: false },
      { inputs: { grid: [["1"]] }, expectedOutput: 1, isHidden: true },
      { inputs: { grid: [["1", "1"], ["1", "1"]] }, expectedOutput: 1, isHidden: true },
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },

  {
    problemId: "CW010",
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description: `## Median of Two Sorted Arrays

Given two sorted arrays, return the median of their combined sorted values. Aim for \`O(log(m+n))\) time.

### Example 1
Input: nums1 = [1,3], nums2 = [2]
Output: 2

### Example 2
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.5`,
    difficulty: "Give Me Code Of War",
    topics: ["Arrays", "Binary Search"],
    tags: ["binary-search", "advanced"],
    constraints: ["0 <= nums1.length, nums2.length <= 1000", "1 <= nums1.length + nums2.length <= 2000", "-1000000 <= nums1[i], nums2[i] <= 1000000", "Both arrays are sorted in non-decreasing order."],
    inputSchema: [
      { name: "nums1", type: "array" },
      { name: "nums2", type: "array" },
    ],
    functionSignature: "findMedianSortedArrays(nums1, nums2)",
    predefinedCode: {
      javascript: "function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n}",
      python: "def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        return 0.0;\n    }\n};",
    },
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2", explanation: "The combined sorted array is [1,2,3]." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "The two middle values are 2 and 3." },
    ],
    testCases: [
      { inputs: { nums1: [1, 3], nums2: [2] }, expectedOutput: 2, isHidden: false },
      { inputs: { nums1: [1, 2], nums2: [3, 4] }, expectedOutput: 2.5, isHidden: false },
      { inputs: { nums1: [], nums2: [1] }, expectedOutput: 1, isHidden: true },
      { inputs: { nums1: [0, 0], nums2: [0, 0] }, expectedOutput: 0, isHidden: true },
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256, maxOutputSizeKb: 1024, wallTimeLimitMs: 5000 },
    outputComparison: "json",
    visibility: "published",
  },
];

async function seedProblems() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from your .env file.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Idempotent seed: rerunning updates these ten problem IDs rather than duplicating them.
    const operations = problems.map((problem) => ({
      updateOne: {
        filter: { problemId: problem.problemId },
        update: { $set: problem },
        upsert: true,
      },
    }));

    const result = await Problem.bulkWrite(operations, { ordered: true });

    console.log("Problem seeding completed.");
    console.log(`Seed definitions: ${problems.length}`);
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log("Difficulty distribution:");
    for (const difficulty of [
      "Give Me Story",
      "Give Me Balanced",
      "Give Me Code Of War",
    ]) {
      console.log(
        `  ${difficulty}: ${problems.filter((p) => p.difficulty === difficulty).length}`
      );
    }
  } catch (error) {
    console.error("Problem seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProblems();
