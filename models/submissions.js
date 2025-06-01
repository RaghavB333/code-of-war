import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'java', 'cpp'],
    },
    results: {
      type: Object,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    problemId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const submissions = mongoose.models.submissions || mongoose.model('submissions', submissionSchema);

module.exports = submissions;
