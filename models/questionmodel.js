const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionname:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    examples:{
        type: Array,
        required: true,
    },
    testcases:{
        type: Array,
        required: true,
    },
    outputs:{
        type: Array,
        required: true,
    },
    difficulty:{
        type: String,
        required: true,
    },
    tags:{
        type: Array,
        required: true,
    },

});

const questionModel = mongoose.model('Question', QuestionSchema);
module.exports = questionModel;

