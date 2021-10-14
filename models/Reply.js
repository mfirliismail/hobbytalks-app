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
ReplySchema.virtual('subReplyCount', {
    ref: "SubReply",
    localField: "subReply",
    foreignField: "replyId",
    count: true
})
ReplySchema.virtual('likeCount', {
    ref: "Reply",
    localField: "likes",
    foreignField: "Users",
    count: true
})
ReplySchema.virtual('dislikeCount', {
    ref: "Reply",
    localField: "dislike",
    foreignField: "Users",
    count: true
})
ReplySchema.set("toObject", { virtuals: true })
ReplySchema.set("toJSON", { virtuals: true })
module.exports = Reply = mongoose.model('Reply', ReplySchema)