const subReply = require("../models/SubReply");
const reply = require("../models/Reply");
const comment = require("../models/Comment");

module.exports = {
    createReply: async(req, res) => {
        const body = req.body;
        const id = req.params.commentId;
        const userId = req.user.id;
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const findComment = await comment.findById(id)
                if (!findComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Can't find comment"
                    })
                }
                const saveReply = await reply.create({
                    userId: userId,
                    commentId: id,
                    content: body.content
                });
                await findComment.reply.unshift(saveReply._id);
                await findComment.save()
                return res.status(201).json({
                    status: "success",
                    message: "Reply created successfully"
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not found or doesn't exist"
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
    readAllReply: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const id = req.params.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findReplies = await reply.find({ commentId: id })
                const replies = await reply.find({ commentId: id }).populate({
                    path: "subReply"
                }).populate([{
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }, "likeCount", "dislikeCount"]).limit(limit * page);
                if (replies.length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Cannot found comment"
                    })
                }
                const findsubReply = await subReply.find({ replyId: replies.id })
                return res.status(200).json({
                    status: "success",
                    message: "Replies retrieved successfully",
                    data: replies,
                    totalsubReply: findsubReply.length,
                    totalPage: Math.ceil(findReplies.length / limit)
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not found or doesn't exist"
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
    updateReply: async(req, res) => {
        const content = req.params.id;
        const body = req.body;
        const userId = req.user.id;
        try {
            if (content.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateReply = await reply.findOneAndUpdate({ _id: content, userId: userId }, body, {
                    returnOriginal: false
                });
                if (!updateReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "You not own this reply"
                    })
                }
                return res.status(201).json({
                    status: "success",
                    message: "Reply updated successfully",
                    data: updateReply,
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Update current reply failed"
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
    deleteReply: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            const paramId = await reply.findById(id)
            if (paramId == null) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot delete"
                })
            }
            const replies = await reply.findOne({ userId: userId })
            if (!replies) {
                return res.status(400).json({
                    status: "failed",
                    message: "reply not found"
                })
            }
            const comments = await comment.findById(paramId.commentId)
            await comments.reply.pull(id)
            await comments.save()
            const deleteReply = await reply.deleteOne({ _id: id })
            if (!deleteReply.deletedCount) {
                return res.status(404).json({
                    status: "failed",
                    message: "Reply doesn't exist"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Reply deleted successfully"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    addUpVote: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id

        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findReply = await reply.findById(id)
                if (!findReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Cannot find reply"
                    })
                }

                if (findReply.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "Failled",
                        message: "Reply already liked"
                    })
                }

                if (findReply.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    const removeIndex = findReply.dislike.map((d) => d.user.toString()).indexOf(userId);
                    findReply.dislike.splice(removeIndex, 1);
                }

                await findReply.likes.unshift({ user: userId })

                await findReply.save()

                return res.status(200).json({
                    status: "success",
                    message: "success like Reply"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Reply not match"
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    },
    deleteUpVote: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findReply = await reply.findById(id)
                if (!findReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findReply.likes.filter((e) => e.user.toString() == userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "reply has not been liked"
                    })
                }

                const removeIndex = findReply.likes.map((l) => l.user.toString()).indexOf(userId);
                findReply.likes.splice(removeIndex, 1);

                await findReply.save()
                return res.status(200).json({
                    status: "success",
                    message: "success delete like"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not match"
                })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    },
    addDownVote: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findReply = await reply.findById(id)
                if (!findReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findReply.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "reply already disliked"
                    })
                }
                if (findReply.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    const removeIndex = findReply.likes.map((l) => l.user.toString()).indexOf(userId);
                    findReply.likes.splice(removeIndex, 1);
                }

                await findReply.dislike.unshift({ user: userId })

                await findReply.save()
                return res.status(200).json({
                    status: "success",
                    message: "success dislike thread"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not match"
                })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    },
    deleteDownVote: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findReply = await reply.findById(id)
                if (!findReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findReply.dislike.filter((e) => e.user.toString() == userId).length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "reply has not been disliked"
                    })
                }

                const removeIndex = findReply.dislike.map((d) => d.user.toString()).indexOf(userId);
                findReply.dislike.splice(removeIndex, 1);

                await findReply.save()
                return res.status(200).json({
                    status: "success",
                    message: "success delete dislike"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not match"
                })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    }
};