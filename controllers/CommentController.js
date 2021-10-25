const Reply = require("../models/Reply");
const comment = require("../models/Comment");
const thread = require("../models/Threads")

module.exports = {
    createComments: async(req, res) => {
        const body = req.body;
        const id = req.params.threadsId;
        const userId = req.user.id;
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const threads = await thread.findById(id)
                if (!threads) {
                    return res.status(400).json({
                        status: "Failed",
                        message: "Can't find Threads"
                    })
                }
                const saveComment = await comment.create({
                    userId: userId,
                    threadId: id,
                    content: body.content
                });
                await threads.comment.unshift(saveComment._id)
                await threads.save()
                return res.status(201).json({
                    status: "success",
                    message: "Comment created successfully"
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not found or doesn't exist"
                })
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readAllComments: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const id = req.params.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findComments = await comment.find({ threadId: id })
                const comments = await comment.find({ threadId: id }).sort({ date: -1 }).populate({
                    path: "reply",
                    populate: ([{
                        path: "subReply",
                        models: "SubReply",
                        populate: ({
                            path: "userId",
                            models: "Users",
                            select: {
                                "name": 1,
                                "email": 1,
                                "avatar": 1
                            }
                        })
                    }, {
                        path: "userId",
                        models: "Users",
                        select: {
                            "name": 1,
                            "email": 1,
                            "avatar": 1
                        }
                    }])
                }).populate([{
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }, "likeCount", "dislikeCount"]).limit(limit * page)
                if (comments.length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Cannot found comment"
                    })
                }
                const findReply = await Reply.find({ commentId: comments.id })
                return res.status(200).json({
                    status: "success",
                    message: "Comment retrieved successfully",
                    data: comments,
                    totalReply: findReply.length,
                    totalPage: Math.ceil(findComments.length / limit)
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not match"
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    updateComments: async(req, res) => {
        const content = req.params.id;
        const body = req.body;
        const userId = req.user.id
        try {
            if (content.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateComment = await comment.findOneAndUpdate({ _id: content, userId: userId }, body, { returnOriginal: false });
                if (!updateComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "You not own this comment"
                    })
                }
                return res.status(201).json({
                    status: "success",
                    message: "Comment updated successfully",
                    data: updateComment,
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Update current comment failed"
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    deleteComments: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            const paramId = await comment.findById(id)
            if (paramId == null) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot delete"
                })
            }
            const comments = await comment.findOne({ userId: userId })
            if (!comments) {
                return res.status(400).json({
                    status: "failed",
                    message: "comment not found"
                })
            }
            const threads = await thread.findById(paramId.threadId)
            await threads.comment.pull(id)
            await threads.save()
            const deleteComment = await comment.deleteOne({ _id: id })
            if (!deleteComment.deletedCount) {
                return res.status(404).json({
                    status: "failed",
                    message: "Comment doesn't exist"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Comment deleted successfully"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
};