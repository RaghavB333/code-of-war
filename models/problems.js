// const mongoose = require('mongoose');

// const problemSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   difficulty: { type: String, required: true },
//   testCases: [
//     {
//       input: { type: mongoose.Schema.Types.Mixed, required: true },  // Allow array, number, string, etc.
//       expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },  // Same as input type
//       explanation: { type: String, required: true },
//     },
//   ],
// });

// const Problem = mongoose.model('Problem', problemSchema);

// module.exports = Problem;


const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: String,
  description: String,
  difficulty: String,
  testCases: [{
    input: { type: String },  // Modify as per your schema
    expectedOutput: { type: String },
    explanation: { type: String }
  }]
});

// Check if the model already exists before creating it
const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

module.exports = Problem;
