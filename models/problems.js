import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    testCases: [
        {
            input: { type: String, required: true },
            expectedOutput: { type: String, required: true },
        },
    ],
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

export default Problem;
