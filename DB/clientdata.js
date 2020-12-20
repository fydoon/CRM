const mongoose = require('mongoose');

const clientschema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        
    },
    gmail: {
        type: String,
        required: true,
    },
    Address: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    },
    mobile:{
        type:Number,
    },
    Dob:{
        type:Date,
    },
    data:{
        type:Date,
        default:Date.now
    },
    photo:{
        type:String,
    }
    
});
module.exports = new mongoose.model('client', clientschema);