const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "Users"
    }],
    dislike: [{
        type: Schema.Types.ObjectId,
        ref: "Users"
    }], //=========================
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comments"
    }], //=========================
    date: {
        type: Date,
        default: Date.now,
    },
})



module.exports = Threads = mongoose.model('Threads', ThreadsSchema);