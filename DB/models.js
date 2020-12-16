const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    data:{
        type:Date,
        default:Date.now

    },
    restToken:String,
    expireToken:Date,
    messages: [{
        type: String,
    }]
});

module.exports = new mongoose.model('users', userschema);