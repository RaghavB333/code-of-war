import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        members: { type: [{name: String, totalPoints: Number}], default: [] },
        owner: { type: String, required: true },
        status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
        sessionend:{ type: Number,default: null},
        startedAt: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
    }
);

const playground = mongoose.models.playground || mongoose.model('playground', playgroundSchema);

module.exports = playground;