const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadsSchema = new Schema({
    users: {
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
        users: {
            type: Schema.Type.ObjectId,
            ref: "Users"
        }
    }],
    dislike: [{
        userId: {
            type: Schema.Type.ObjectId,
            ref: "Users"
        }
    }],
    comment: [{
        userId: {
            type: Schema.Type.ObjectId,
            ref: "Users"
        },
        content: {
            type: String
        },
        likes: [{
            userId: {
                type: Schema.Type.ObjectId,
                ref: "Users"
            }
        }],
        dislike: [{
            userId: {
                type: Schema.Type.ObjectId,
                ref: "Users"
            }
        }],
        reply: [{
            userId: {
                type: Schema.Type.ObjectId,
                ref: "Users"
            },
            content: {
                type: String
            },
            likes: [{
                userId: {
                    type: Schema.Type.ObjectId,
                    ref: "Users"
                }
            }],
            dislike: [{
                userId: {
                    type: Schema.Type.ObjectId,
                    ref: "Users"
                }
            }],
            subReplay: [{
                userId: {
                    type: Schema.Type.ObjectId,
                    ref: "Users"
                },
                content: {
                    type: String
                },
                likes: [{
                    userId: {
                        type: Schema.Type.ObjectId,
                        ref: "Users"
                    }
                }],
                dislike: [{
                    userId: {
                        type: Schema.Type.ObjectId,
                        ref: "Users"
                    }
                }],
            }]
        }]
    }],
    date: {
        type: Date,
        default: Date.now,
    }
})



module.exports = Threads = mongoose.model('Threads', ThreadsSchema);