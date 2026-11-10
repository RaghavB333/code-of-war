const mongoose = require("mongoose");
const { Schema } = mongoose;

const DIFFICULTIES = ["Give Me Story", "Give Me Balanced", "Give Me Code Of War"];

/* One problem solved by one member (counted once per member per problem). */
const solvedSchema = new Schema(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    submission: { type: Schema.Types.ObjectId, ref: "Submission", required: true },
    score: { type: Number, required: true, min: 0 },
    solvedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* A person in the lobby: invited -> joined -> (left | kicked). */
const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "player"], default: "player" },
    status: {
      type: String,
      enum: ["invited", "joined", "declined", "left", "kicked", "expired"],
      default: "invited",
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: null },

    // live scoreboard data (only ever written by the server)
    totalScore: { type: Number, default: 0, min: 0 },
    solved: { type: [solvedSchema], default: [] },
    lastSolvedAt: { type: Date, default: null }, // tie-breaker: earlier wins
  },
  { _id: false }
);

/* Problems are fixed when the game starts, together with their point value. */
const lobbyProblemSchema = new Schema(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    points: { type: Number, required: true, min: 0 },
    order: { type: Number, required: true },
  },
  { _id: false }
);

/* Final standings, written once when the game ends. */
const resultSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    solvedCount: { type: Number, required: true },
    lastSolvedAt: { type: Date, default: null },
  },
  { _id: false }
);

const playgroundSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, trim: true, maxlength: 60, default: "Coding Battle" },

    // short code for "join with code" / share link, e.g. K7QX2M
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    // waiting -> active -> completed   (waiting -> cancelled)
    status: {
      type: String,
      enum: ["waiting", "active", "completed", "cancelled"],
      default: "waiting",
      index: true,
    },

    settings: {
      maxPlayers: { type: Number, default: 4, min: 2, max: 10 },
      durationMinutes: { type: Number, default: 60, min: 5, max: 360 },
      problemCount: { type: Number, default: 3, min: 1, max: 20 },
      difficulty: { type: String, enum: [...DIFFICULTIES, "mixed"], default: "mixed" },
      pointsByDifficulty: {
        "Give Me Story": { type: Number, default: 100 },
        "Give Me Balanced": { type: Number, default: 200 },
        "Give Me Code Of War": { type: Number, default: 300 },
      },
      // each wrong attempt before the first accept costs this much (never below 50% of the problem's points)
      wrongAttemptPenalty: { type: Number, default: 10, min: 0 },
      allowLateJoin: { type: Boolean, default: false },
    },

    // how the problems are chosen when the owner presses Start
    selection: {
      mode: { type: String, enum: ["automatic", "manual"], default: "automatic" },
      problemIds: [{ type: Schema.Types.ObjectId, ref: "Problem" }], // used when mode === "manual"
    },

    members: { type: [memberSchema], default: [] },

    problems: { type: [lobbyProblemSchema], default: [] }, // empty until the game starts

    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null }, // the server clock decides when it is over
    endedAt: { type: Date, default: null },

    results: { type: [resultSchema], default: [] },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// "my lobbies" and "my pending invites"
playgroundSchema.index({ "members.user": 1, status: 1 });
// sweeper that finishes games whose time is up
playgroundSchema.index({ status: 1, endsAt: 1 });

// Model name is "Playground" (capital P) so `ref: "Playground"` in Submission works.
module.exports = mongoose.models.Playground || mongoose.model("Playground", playgroundSchema);









// const mongoose = require('mongoose');

// const playgroundSchema = new mongoose.Schema(
//     {
//         owner: { type: String, required: true },
//         members: [{member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },totalPoints: Number}],
//         problemsData: { type: { count: Number, difficulty: String, problems: [{type: mongoose.Schema.Types.ObjectId,
//             ref: "Problem"}]}},
//         status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
//         sessionend:{ type: Number,default: null},
//         startedAt: { type: Date, default: Date.now },
//         createdAt: { type: Date, default: Date.now }
//     }
// );

// const playground = mongoose.models.playground || mongoose.model('playground', playgroundSchema);

// module.exports = playground;


