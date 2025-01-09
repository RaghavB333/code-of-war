const userModel = require('../models/user.model');
const {validationResult} = require('express-validator');

module.exports.addFriend = async(req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    const {friend_email} = req.body;

    const friend = await userModel.findOne({email: friend_email});

    if(!friend)
    {
        return res.status(404).json({message: 'Friend not found'});
    }

    user.friends.push(friend_email);
    await user.save();

    res.status(200).json({user});
}

module.exports.getFriends = async(req,res,next) =>{
    const user = req.user;
    res.status(200).json({friends: user.friends});
}