const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comments"
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
    subReply: [{
        type: Schema.Types.ObjectId,
        ref: "SubReply"
    }], //=========================
    date: {
        type: Date,
        default: Date.now,
    }
})

module.exports = Reply = mongoose.model('Reply', ReplySchema)