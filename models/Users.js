const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    banner: {
        type: String,
    },
    bio: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifCode: {
        type: String
    },
    categoryLike: [{
        type: Schema.Types.ObjectId,
        ref: "Category"
    }],
    threads: [{
        type: Schema.Types.ObjectId,
        ref: "Threads"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "Threads"
    }]
})

module.exports = Users = mongoose.model('Users', UsersSchema);