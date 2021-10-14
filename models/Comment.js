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
    }], //=========================
    reply: [{
        type: Schema.Types.ObjectId,
        ref: "Reply"
    }], //=========================
    date: {
        type: Date,
        default: Date.now,
    }
})

CommentSchema.virtual('replyCount', {
    ref: "Reply",
    localField: "reply",
    foreignField: "commentId",
    count: true
})
CommentSchema.set("toObject", { virtuals: true })
CommentSchema.set("toJSON", { virtuals: true })
module.exports = Comments = mongoose.model('Comments', CommentSchema)