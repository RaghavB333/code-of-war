const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
       username:{
        type: String,
        required: true,
        minlength: [3,'First name must be at least 3 characters long'],
       },
    email:{
        type: String,
        required: true,
        unique: true,
        minlength: [5,'Email name must be at least 5 characters long'],
    },
    authProvider: {
        type: String,
        enum: ["credentials", "google"],
        default: "credentials",
  },
    password:{
        type: String,
        required: function() {
        return this.authProvider === "credentials";
        },
        select: false,       
    },
    notifications:{
        type: [
            {
              senderEmail: {
                type: String,
                default: '',
              },
              receiverEmail: {
                type: String,
                default: '',
              },
              status: {
                type: String,
                default: 'pending',
              },
              createdAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
          default: [],
    },
    friends:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // self-reference to the same collection
    },
    ],
    socketId:{
        type: String,
        default: ''
    },
    streak: {
        current: { type: Number, default: 0 },
        max: { type: Number, default: 0 },          
        lastSubmissionDate: { type: Date, default: null },  
    },
    submissionDates: {
        type: [String], // Format: "YYYY-MM-DD"
        default: [],
    },
    easyproblemssolved:{
        type: Number,
        default: 0
    },
    mediumproblemssolved:{
        type: Number,
        default: 0
    },
    hardproblemssolved:{
        type: Number,
        default: 0
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id},process.env.JWT_SECRET,{expiresIn: '7d'});
    return token;
}

userSchema.statics.comparePassword = async function (password,hashPassword) {
    return await bcrypt.compare(password,hashPassword);
}
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password,10);
}

// const userModel = mongoose.models.userModel || mongoose.model('userModel', userSchema);
const userModel = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = userModel;