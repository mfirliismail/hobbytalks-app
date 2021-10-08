const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    userId: {
        type: Schema.Type.ObjectId,
        ref: "Users"
    },
    threadId: {
        type: Schema.Type.ObjectId,
        ref: "Threads"
    },
    content: {
        type: String
    },
    likes: [{
        type: Schema.Type.ObjectId,
        ref: "Users"
    }],
    dislike: [{

        type: Schema.Type.ObjectId,
        ref: "Users"

    }]
})

module.exports = Comments = model('Comments', CommentSchema)