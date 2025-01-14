const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
    password:{
        type: String,
        required: true,
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
    friends:{
        type: Array,
        default: [],
    },
    socketId:{
        type: String,
        default: ''
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id},process.env.JWT_SECRET,{expiresIn: '24h'});
    return token;
}

userSchema.statics.comparePassword = async function (password,hashPassword) {
    return await bcrypt.compare(password,hashPassword);
}
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password,10);
}

const userModel = mongoose.models.userModel || mongoose.model('userModel', userSchema);

module.exports = userModel;