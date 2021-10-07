const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
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
    categoryLike: [{
        categoryId: {
            type: Schema.Type.ObjectId,
            ref: "Category"
        }
    }],
    threads: [{
        threadId: {
            type: Schema.Type.ObjectId,
            ref: "Threads"
        }
    }],
    following: [{
        threadId: {
            type: Schema.Type.ObjectId,
            ref: "Threads"
        }
    }]
})



module.exports = Users = mongoose.model('Users', ThreadsSchema);