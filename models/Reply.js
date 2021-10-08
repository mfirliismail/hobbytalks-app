const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    userId: {
        type: Schema.Type.ObjectId,
        ref: "Users"
    },
    commentId: {
        type: Schema.Type.ObjectId,
        ref: "Comments"
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

module.exports = Reply = model('Reply', ReplySchema)