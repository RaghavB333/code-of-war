const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const friendcontroller = require('../controller/friend.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/add-friend',[
    body('friend_email').isEmail().withMessage('Invalid Email'),
    body('email').isEmail().withMessage('Invalid Email'),

],
    friendcontroller.addFriend
);

router.get('/friends', authMiddleware.authUser, friendcontroller.getFriends);