const userModel = require('@/models/user.model');
const userService = require('../services/user.service');
const {validationResult} = require('express-validator');
const blacklistTokenModel = require('@/models/blacklistToken.model');
import mongoBD from '@/lib/mongoose';

module.exports.registerUser = async(req,res,next) =>{

    await mongoBD();
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    const {username,email,password,confirmPassword} = req.body;
    console.log(username,email,password,confirmPassword);

    const isuser = await userModel.findOne({email});

    if(isuser)
    {
        return res.status(400).json({message: 'User already exists'});
    }

    if(password == confirmPassword)
    {
        return res.status(400).json({message: 'Passwords do not match'});
    }

    const hashPassword = await userModel.hashPassword(password);
    console.log(hashPassword);

    const user = await userService.createUser({
        username: username,
        email: email,
        password: hashPassword
    });

    const token = user.generateAuthToken();
    res.status(201).json({token,user})

}

module.exports.loginUser = async(req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    const {email,password} = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user)
    {
        return res.status(401).json({message: 'Invalid Email or Password'});
    }

    const validPassword = await userModel.comparePassword(password,user.password);

    if(!validPassword)
    {
        return res.status(401).json({message: 'Invalid Email or Password'});
    }

    const token = user.generateAuthToken();
    res.status(200).json({token,user});
}

module.exports.getUserProfile = async(req,res,next) =>{
   res.status(200).json(req.user); 
}

module.exports.logoutUser = async(req,res,next) =>{
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await blacklistTokenModel.create({token});
    res.status(200).json({message: 'Logged Out Successfully'});
}