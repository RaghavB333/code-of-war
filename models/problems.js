
const mongoose = require("mongoose");

const inputFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "number",
        "string",
        "boolean",
        "array",
        "matrix",
        "linkedList",
        "binaryTree",
        "object",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
    imageUrl: { type: String, default: null },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    expectedOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isHidden: {
      type: Boolean,
      default: true,
    },

    points: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    problemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
    },

    contentFormat: {
      type: String,
      enum: ["markdown"],
      default: "markdown",
    },

    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        caption: { type: String, default: "" },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
      },
    ],

    difficulty: {
      type: String,
      enum: [
        "Give Me Story",
        "Give Me Balanced",
        "Give Me Code Of War",
      ],
      required: true,
      index: true,
    },

    topics: [{ type: String, trim: true }],

    tags: [{ type: String, trim: true }],

    constraints: [{ type: String }],

    languageWrappers: {
    python: String,
    javascript: String,
    java: String,
    cpp: String,
  },

    // Function parameters and their order/types
    inputSchema: {
      type: [inputFieldSchema],
      default: [],
    },

    functionSignature: {
      type: String,
      required: true,
    },

    predefinedCode: {
      python: String,
      javascript: String,
      java: String,
      cpp: String,
    },

    // Public examples displayed in the problem statement
    examples: {
      type: [exampleSchema],
      default: [],
    },

    // Public and hidden judge test cases
    testCases: {
      type: [testCaseSchema],
      default: [],
    },

    limits: {
      // Judge0 time_limit = timeLimitMs / 1000
      timeLimitMs: {
        type: Number,
        default: 2000,
        min: 100,
      },

      // Judge0 memory_limit is normally specified in KB
      memoryLimitMb: {
        type: Number,
        default: 256,
        min: 16,
      },

      // Optional additional output safeguard
      maxOutputSizeKb: {
        type: Number,
        default: 1024,
        min: 1,
      },

      // Optional wall-clock limit; useful for runaway executions
      wallTimeLimitMs: {
        type: Number,
        default: 5000,
        min: 100,
      },
    },

    // How actual and expected outputs should be compared
    outputComparison: {
      type: String,
      enum: ["exact", "trimmed", "json"],
      default: "trimmed",
    },

    testCaseSetVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    visibility: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    stats: {
      acceptedCount: { type: Number, default: 0 },
      submissionCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

problemSchema.index({
  visibility: 1,
  difficulty: 1,
  createdAt: -1,
});

const Problem =
  mongoose.models.Problem ||
  mongoose.model("Problem", problemSchema);

module.exports = Problem;

