const mongoose = require('mongoose');

const playgroundSchema = new mongoose.Schema(
    {
        owner: { type: String, required: true },
        members: [{member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },totalPoints: Number}],
        problemsData: { type: { count: Number, difficulty: String, problems: [{type: mongoose.Schema.Types.ObjectId,
            ref: "Problem"}]}},
        status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
        sessionend:{ type: Number,default: null},
        startedAt: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
    }
);

const playground = mongoose.models.playground || mongoose.model('playground', playgroundSchema);

module.exports = playground;