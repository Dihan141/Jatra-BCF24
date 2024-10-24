const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
},{
    timeStamps: true
});

module.exports = mongoose.model('User', userSchema);