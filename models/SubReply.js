const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubReplySchema = new Schema({
    userId: {
        type: Schema.Type.ObjectId,
        ref: "Users"
    },
    replyId: {
        type: Schema.Type.ObjectId,
        ref: "Reply"
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

module.exports = SubReply = model('SubReply', SubReplySchema)