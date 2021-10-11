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
                        message: "Wrong Id Threads"
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
        const id = req.params.id
        try {
            const comments = await comment.find({ threadId: id }).populate({
                path: "reply",
                populate: ({
                    path: "subReply",
                    models: "SubReply",
                })
            })
            console.log(comments)
            const findReply = await Reply.find({ commentId: comments.id })
            return res.status(200).json({
                status: "success",
                message: "Comment retrieved successfully",
                data: comments,
                totalReply: findReply.length
            });
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
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateComment = await comment.findOneAndUpdate({ id: content, userId: userId }, body, { returnOriginal: false });
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
            await threads.comment.shift(id)
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