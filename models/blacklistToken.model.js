const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds
    }
});

const BlacklistToken = mongoose.models.BlacklistToken || mongoose.model('BlacklistToken', BlacklistTokenSchema);

module.exports = BlacklistToken;

// module.exports = mongoose.model('BlacklistToken', BlacklistTokenSchema);