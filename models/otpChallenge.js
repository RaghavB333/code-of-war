const mongoose = require('mongoose');
const otpChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["verify_email", "reset_password"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    resendCount: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Cleanup only; application must still enforce expiresAt.
otpChallengeSchema.index(
  { email: 1, purpose: 1 },
  { unique: true }
);

otpChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const otpChallenge = mongoose.models.OtpChallenge || mongoose.model('OtpChallenge', otpChallengeSchema);

module.exports = otpChallenge;
