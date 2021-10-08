const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    commentId: {
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

    }]
})

module.exports = Reply = model('', ReplySchema)