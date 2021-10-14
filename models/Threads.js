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
    image: {
        type: String
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
ThreadsSchema.virtual('commentCount', {
    ref: "Comments",
    localField: "comment",
    foreignField: "threadId",
    count: true
})
ThreadsSchema.virtual('likeCount', {
    ref: "Threads",
    localField: "likes",
    foreignField: "Users",
    count: true
})
ThreadsSchema.virtual('dislikeCount', {
    ref: "Threads",
    localField: "dislike",
    foreignField: "Users",
    count: true
})
ThreadsSchema.set("toObject", { virtuals: true })
ThreadsSchema.set("toJSON", { virtuals: true })

module.exports = Threads = mongoose.model('Threads', ThreadsSchema);