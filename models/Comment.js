const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    threadId: {
        type: Schema.Types.ObjectId,
        ref: "Threads"
    },
    content: {
        type: String
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "Users"
    }],
    dislike: [{

        type: Schema.Types.ObjectId,
        ref: "Users"

    }],
    date: {
        type: Date,
        default: Date.now,
    }
})

module.exports = Comments = mongoose.model('Comments', CommentSchema)