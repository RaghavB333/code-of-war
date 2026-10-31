import mongoose from "mongoose";

// What we store about the failing test case. Hidden cases only keep
// number/hidden/verdict; inputs/expected/actual exist only for public cases.
const failedCaseSchema = new mongoose.Schema(
  {
    number: Number,
    hidden: Boolean,
    verdict: String,
    inputs: mongoose.Schema.Types.Mixed,
    expected: String,
    actual: String,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },

    playground: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playground",
      default: null,
      index: true,
    },

    code: {
      type: String,
      required: true,
      maxlength: 100000,
    },

    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "queued",
        "processing",
        "accepted",
        "wrong_answer",
        "compilation_error",
        "runtime_error",
        "time_limit_exceeded",
        "memory_limit_exceeded",
        "internal_error",
      ],
      default: "queued",
      index: true,
    },

    execution: {
      judgeToken: { type: String, select: false },
      timeMs: { type: Number, default: null },
      memoryKb: { type: Number, default: null },
      passedTests: { type: Number, default: 0 },
      totalTests: { type: Number, default: 0 },
    },

    failedCase: { type: failedCaseSchema, default: null },

    scoreAwarded: { type: Number, default: 0 },

    errorMessage: { type: String, default: null },

    submittedAt: { type: Date, default: Date.now, index: true },

    judgedAt: { type: Date, default: null },

    idempotencyKey: { type: String, select: false },
  },
  { timestamps: true }
);

// "My submissions for this problem", newest first.
submissionSchema.index({ user: 1, problem: 1, submittedAt: -1 });
// Runtime / memory percentile + distribution among accepted submissions.
submissionSchema.index({ problem: 1, language: 1, status: 1, "execution.timeMs": 1 });

export default mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
