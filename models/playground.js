import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
    {
        id:{
            type: String,
            required: true
        },
        members:{
            type: Array,
            default: []
        },
        timestamp: {
            type: Date,
            default: Date.now,
          }
    }
);

const playground = mongoose.models.playground || mongoose.model('playground', playgroundSchema);

module.exports = playground;