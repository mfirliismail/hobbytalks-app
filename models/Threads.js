const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadsSchema = new Schema({
    userId: {
        type: Schema.Type.ObjectId,
        ref: "Users"
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Type.ObjectId,
        ref: "Category",
        required: true
    },
    likes: [{
        type: Schema.Type.ObjectId,
        ref: "Users"
    }],
    dislike: [{
        type: Schema.Type.ObjectId,
        ref: "Users"
    }],
    comment: [{
        type: Schema.Type.ObjectId,
        ref: "Comments"
    }],
    reply: [{
        type: Schema.Type.ObjectId,
        ref: "Reply"
    }],
    subReply: [{
        type: Schema.TypeObjectId,
        ref: "subReply"
    }]

})



module.exports = Threads = mongoose.model('Threads', ThreadsSchema);