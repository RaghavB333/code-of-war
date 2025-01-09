const express = require('express');
const router = express.Router();
const questionModel = require('../models/question.model');

router.get('/questions', async(req, res) => {

    const questions = await questionModel.find({});

    if(!questions)
    {
        return res.status(404).json({message: 'Questions not found'});
    }
    res.send(questions);
});