const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubReplySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    replyId: {
        type: Schema.Types.ObjectId,
        ref: "Reply"
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


module.exports = SubReply = mongoose.model('SubReply', SubReplySchema)