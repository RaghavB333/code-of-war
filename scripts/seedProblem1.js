
require('dotenv').config({ path: '.env.local' });
const mongoose = require("mongoose");
const Problem = require('../models/problems');

const problems = [
  // 1. Easy — Two Numbers Sum
  {
    problemId: "CW001",
    slug: "sum-of-two-numbers",
    title: "Sum of Two Numbers",
    description: `# Sum of Two Numbers

Given two integers \`a\` and \`b\`, return their sum.

### Example 1
Input: a = 5, b = 4
Output: 9

### Example 2
Input: a = -3, b = 7
Output: 4

### Example 3
Input: a = 0, b = 0
Output: 0`,
    difficulty: "Give Me Story",
    topics: ["Math", "Basic Programming"],
    tags: ["beginner", "arithmetic"],
    constraints: [
      "-10^9 <= a, b <= 10^9",
      "Both inputs are integers."
    ],
    functionSignature: "sum(a, b)",
    predefinedCode: {
      javascript: "function sum(a, b) {\n  // Write your code here\n}",
      python: "def sum(a, b):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public long sum(long a, long b) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    long long sum(long long a, long long b) {\n        // Write your code here\n        return 0;\n    }\n};"
    },
    examples: [
      { input: "a = 5, b = 4", output: "9", explanation: "5 + 4 = 9." },
      { input: "a = -3, b = 7", output: "4", explanation: "-3 + 7 = 4." }
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128 },
    visibility: "published"
  },

  // 2. Easy — Reverse a String
  {
    problemId: "CW002",
    slug: "reverse-a-string",
    title: "Reverse a String",
    description: `# Reverse a String

Given a string \`s\`, return the string with its characters in reverse order.

### Example 1
Input: s = "hello"
Output: "olleh"

### Example 2
Input: s = "Code"
Output: "edoC"

### Example 3
Input: s = "a"
Output: "a"`,
    difficulty: "Give Me Story",
    topics: ["Strings", "Two Pointers"],
    tags: ["string", "beginner"],
    constraints: [
      "1 <= s.length <= 100000",
      "s contains printable ASCII characters."
    ],
    functionSignature: "reverseString(s)",
    predefinedCode: {
      javascript: "function reverseString(s) {\n  // Write your code here\n}",
      python: "def reverseString(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String reverseString(String s) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string reverseString(string s) {\n        // Write your code here\n        return \"\";\n    }\n};"
    },
    examples: [
      { input: 's = "hello"', output: '"olleh"', explanation: "The characters are reversed." },
      { input: 's = "Code"', output: '"edoC"', explanation: "The reversed string is edoC." }
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128 },
    visibility: "published"
  },

  // 3. Easy — Palindrome Number
  {
    problemId: "CW003",
    slug: "palindrome-number",
    title: "Palindrome Number",
    description: `# Palindrome Number

Given an integer \`n\`, return true if it reads the same forward and backward. Otherwise, return false.

Negative numbers are not palindromes.

### Example 1
Input: n = 121
Output: true

### Example 2
Input: n = -121
Output: false

### Example 3
Input: n = 10
Output: false`,
    difficulty: "Give Me Story",
    topics: ["Math", "Strings"],
    tags: ["palindrome", "number"],
    constraints: [
      "-2^31 <= n <= 2^31 - 1"
    ],
    functionSignature: "isPalindrome(n)",
    predefinedCode: {
      javascript: "function isPalindrome(n) {\n  // Write your code here\n}",
      python: "def isPalindrome(n):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isPalindrome(int n) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(int n) {\n        // Write your code here\n        return false;\n    }\n};"
    },
    examples: [
      { input: "n = 121", output: "true", explanation: "121 is the same in both directions." },
      { input: "n = -121", output: "false", explanation: "The negative sign makes it different." }
    ],
    limits: { timeLimitMs: 1000, memoryLimitMb: 128 },
    visibility: "published"
  },

  // 4. Medium — Two Sum
  {
    problemId: "CW004",
    slug: "two-sum",
    title: "Two Sum",
    description: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return the indices of two distinct elements whose sum equals target.

Assume exactly one valid answer exists. Return the smaller index first.

### Example 1
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]

### Example 2
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]

### Example 3
Input: nums = [3, 3], target = 6
Output: [0, 1]`,
    difficulty: "Give Me Balanced",
    topics: ["Arrays", "Hash Map"],
    tags: ["array", "hashmap", "interview"],
    constraints: [
      "2 <= nums.length <= 100000",
      "-10^9 <= nums[i], target <= 10^9",
      "Exactly one valid answer exists.",
      "You cannot use the same element twice."
    ],
    functionSignature: "twoSum(nums, target)",
    predefinedCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n}",
      python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};"
    },
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 9." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explanation: "2 + 4 = 6." }
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 5. Medium — Best Time to Buy and Sell Stock
  {
    problemId: "CW005",
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    description: `# Best Time to Buy and Sell Stock

Given an array \`prices\`, where prices[i] is a stock's price on day i, choose one day to buy and a later day to sell.

Return the maximum possible profit. If no profit is possible, return 0.

### Example 1
Input: prices = [7, 1, 5, 3, 6, 4]
Output: 5

### Example 2
Input: prices = [7, 6, 4, 3, 1]
Output: 0`,
    difficulty: "Give Me Balanced",
    topics: ["Arrays", "Dynamic Programming"],
    tags: ["greedy", "optimization"],
    constraints: [
      "1 <= prices.length <= 100000",
      "0 <= prices[i] <= 100000"
    ],
    functionSignature: "maxProfit(prices)",
    predefinedCode: {
      javascript: "function maxProfit(prices) {\n  // Write your code here\n}",
      python: "def maxProfit(prices):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n        return 0;\n    }\n};"
    },
    examples: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5", explanation: "Buy at 1 and sell at 6." },
      { input: "prices = [7, 6, 4, 3, 1]", output: "0", explanation: "No profitable transaction exists." }
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 6. Medium — Valid Parentheses
  {
    problemId: "CW006",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: `# Valid Parentheses

Given a string containing only the characters \`()[]{ }\` (without the space inside the braces), determine whether the brackets are valid.

An opening bracket must be closed by the same type of bracket, in the correct order.

### Example 1
Input: s = "()"
Output: true

### Example 2
Input: s = "()[]{}"
Output: true

### Example 3
Input: s = "(]"
Output: false

### Example 4
Input: s = "([{}])"
Output: true`,
    difficulty: "Give Me Balanced",
    topics: ["Strings", "Stack"],
    tags: ["stack", "brackets"],
    constraints: [
      "1 <= s.length <= 100000",
      "s contains only (, ), [, ], { and }."
    ],
    functionSignature: "isValid(s)",
    predefinedCode: {
      javascript: "function isValid(s) {\n  // Write your code here\n}",
      python: "def isValid(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};"
    },
    examples: [
      { input: 's = "()[]{}"', output: "true", explanation: "Each bracket closes correctly." },
      { input: 's = "(]"', output: "false", explanation: "The bracket types do not match." }
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 7. Medium — Longest Substring Without Repeating Characters
  {
    problemId: "CW007",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    description: `# Longest Substring Without Repeating Characters

Given a string \`s\`, return the length of the longest substring that contains no repeated characters.

### Example 1
Input: s = "abcabcbb"
Output: 3

### Example 2
Input: s = "bbbbb"
Output: 1

### Example 3
Input: s = "pwwkew"
Output: 3`,
    difficulty: "Give Me Balanced",
    topics: ["Strings", "Hash Map", "Sliding Window"],
    tags: ["sliding-window", "optimization"],
    constraints: [
      "0 <= s.length <= 50000",
      "s contains English letters, digits, symbols and spaces."
    ],
    functionSignature: "lengthOfLongestSubstring(s)",
    predefinedCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n}",
      python: "def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};"
    },
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: '"abc" is a longest valid substring.' },
      { input: 's = "bbbbb"', output: "1", explanation: '"b" is the longest valid substring.' }
    ],
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 8. Hard — Merge Intervals
  {
    problemId: "CW008",
    slug: "merge-intervals",
    title: "Merge Intervals",
    description: `# Merge Intervals

Given an array of intervals, merge all overlapping intervals and return the resulting intervals.

### Example 1
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]

### Example 2
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]`,
    difficulty: "Give Me Code Of War",
    topics: ["Arrays", "Sorting"],
    tags: ["intervals", "sorting"],
    constraints: [
      "1 <= intervals.length <= 100000",
      "intervals[i].length == 2",
      "0 <= start <= end <= 100000"
    ],
    functionSignature: "merge(intervals)",
    predefinedCode: {
      javascript: "function merge(intervals) {\n  // Write your code here\n}",
      python: "def merge(intervals):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your code here\n        return new int[0][];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your code here\n        return {};\n    }\n};"
    },
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Touching intervals are merged." }
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 9. Hard — Number of Islands
  {
    problemId: "CW009",
    slug: "number-of-islands",
    title: "Number of Islands",
    description: `# Number of Islands

Given a grid containing \`1\` (land) and \`0\` (water), count the number of islands.

An island consists of connected land cells horizontally or vertically. The grid is surrounded by water.

### Example 1
Input: grid = [["1","1","0"],["1","0","0"],["0","0","1"]]
Output: 2

### Example 2
Input: grid = [["0","0"],["0","0"]]
Output: 0`,
    difficulty: "Give Me Code Of War",
    topics: ["Arrays", "Graph", "DFS", "BFS"],
    tags: ["matrix", "graph-traversal"],
    constraints: [
      "1 <= rows, columns <= 300",
      "grid[i][j] is either 0 or 1."
    ],
    functionSignature: "numIslands(grid)",
    predefinedCode: {
      javascript: "function numIslands(grid) {\n  // Write your code here\n}",
      python: "def numIslands(grid):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};"
    },
    examples: [
      { input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: "2", explanation: "There are two separate land groups." },
      { input: 'grid = [["0","0"],["0","0"]]', output: "0", explanation: "The grid contains no land." }
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256 },
    visibility: "published"
  },

  // 10. Hard — Median of Two Sorted Arrays
  {
    problemId: "CW010",
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description: `# Median of Two Sorted Arrays

Given two sorted arrays \`nums1\` and \`nums2\`, return the median of the combined sorted array.

Your solution should run in O(log(m + n)) time.

The median is the middle element for an odd number of elements, or the average of the two middle elements for an even number.

### Example 1
Input: nums1 = [1,3], nums2 = [2]
Output: 2.0

### Example 2
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.5`,
    difficulty: "Give Me Code Of War",
    topics: ["Arrays", "Binary Search"],
    tags: ["binary-search", "advanced"],
    constraints: [
      "0 <= nums1.length, nums2.length <= 1000",
      "1 <= nums1.length + nums2.length <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
      "Both arrays are sorted in non-decreasing order."
    ],
    functionSignature: "findMedianSortedArrays(nums1, nums2)",
    predefinedCode: {
      javascript: "function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n}",
      python: "def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        return 0.0;\n    }\n};"
    },
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "The combined sorted array is [1,2,3]." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "The middle values are 2 and 3." }
    ],
    limits: { timeLimitMs: 3000, memoryLimitMb: 256 },
    visibility: "published"
  }
];

async function seedProblems() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const operations = problems.map((problem) => ({
      updateOne: {
        filter: { problemId: problem.problemId },
        update: { $set: problem },
        upsert: true,
      },
    }));

    const result = await Problem.bulkWrite(operations);

    console.log("Problem seeding completed!");
    console.log(`Problems in seed file: ${problems.length}`);
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Problem seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProblems();
