const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema({
    _userId: [{
        type: Type.Schema.ObjectId,
        ref: "Users"
    }],
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expires: 86400000
        }
    }
})