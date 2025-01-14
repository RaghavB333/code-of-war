const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
  problemId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  functionSignature: { type: String, required: true },
  predefinedCode: {
    python: { type: String },
    javascript: { type: String },
    java: { type: String },
    cpp: { type: String }  // Added C++ support
  },
  examples: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true }
    }
  ],
  testCases: [
    {
      inputs: { type: Map, of: Schema.Types.Mixed, required: true },
      expectedOutput: { type: Schema.Types.Mixed, required: true }
    }
  ]
});

// Check if the model already exists before creating it
const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

module.exports = Problem;
