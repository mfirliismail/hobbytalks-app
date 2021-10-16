const reply = require("../models/Reply");
const subReply = require("../models/SubReply");
const thread = require("../models/Threads")

module.exports = {
    createSubReply: async(req, res) => {
        const body = req.body;
        const id = req.params.replyId;
        const userId = req.user.id;
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const findReply = await reply.findById(id)
                if (!findReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot find reply"
                    })
                }
                const saveSubReply = await subReply.create({
                    userId: userId,
                    replyId: id,
                    content: body.content
                });
                await findReply.subReply.unshift(saveSubReply._id)
                await findReply.save()
                return res.status(201).json({
                    status: "success",
                    message: "subReply created successfully"
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
    readAllSubReply: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const id = req.params.replyId
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findSubReply = await subReply.find({ replyId: id })
                const subreplies = await subReply.find({ replyId: id }).populate([{
                    path: 'userId',
                    model: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }, "likeCount", "dislikeCount"]).limit(limit * page)
                if (subreplies.length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot find reply"
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "subReplies retrieved successfully",
                    data: subreplies,
                    totalSubReplies: findSubReply,
                    totalPage: Math.ceil(findSubReply.length / limit)
                })
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
    updateSubReply: async(req, res) => {
        const content = req.params.id;
        const body = req.body;
        const userId = req.user.id
        try {
            if (content.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateSubReply = await subReply.findOneAndUpdate({ _id: content, userId: userId }, body, {
                    returnOriginal: false
                });
                if (!updateSubReply) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot update sub reply"
                    })
                }
                return res.status(201).json({
                    status: "success",
                    message: "subReply updated successfully",
                    data: updateSubReply,
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Update current subReply failed"
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
    deleteSubReply: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            const paramId = await subReply.findById(id)
            if (paramId == null) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot delete"
                })
            }
            const subReplies = await subReply.findOne({ userId: userId })
            if (!subReplies) {
                return res.status(400).json({
                    status: "failed",
                    message: "reply not found"
                })
            }
            const replys = await reply.findById(paramId.replyId)
            await replys.subReply.pull(id)
            await replys.save()
            const deleteSubReply = await subReply.deleteOne({ _id: id })
            if (!deleteSubReply.deletedCount) {
                return res.status(404).json({
                    status: "failed",
                    message: "subReply doesn't exist"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "subReply deleted successfully"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    upvoteSubReply: async(req, res) => {
        const subreplyId = req.params.id
        const userId = req.user.id
        try {
            if (subreplyId.match(/^[0-9a-fA-F]{24}$/)) {
                const subreply = await subReply.findById(subreplyId);
                console.log(subreply)
                if (subreply.likes.filter((like) => like.user.toString() === userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Already vote"
                    })
                }

                if (subreply.dislike.filter((dislikes) => dislikes.user.toString() === userId).length > 0) {
                    const removeIndex = subreply.dislike.map((d) => d.user.toString()).indexOf(userId);
                    subreply.dislike.splice(removeIndex, 1);
                }

                await subreply.likes.unshift({ user: userId })

                await subreply.save()
                res.status(200).json({
                    status: "success",
                    message: "You successfully upvote"
                })
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
    deleteUpvote: async(req, res) => {
        const subreplyId = req.params.id
        const userId = req.user.id
        try {
            if (subreplyId.match(/^[0-9a-fA-F]{24}$/)) {
                const subreply = await subReply.findById(subreplyId);

                if (subreply.likes.filter((like) => like.user.toString() === userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "There is no vote"
                    })
                }

                const removeIndex = subreply.likes.map((l) => l.user.toString()).indexOf(userId);
                subreply.likes.splice(removeIndex, 1);
                await subreply.save()
                res.status(200).json({
                    status: "success",
                    message: "You successfully delete upvote"
                })
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
    downVoteSubReply: async(req, res) => {
        const subreplyId = req.params.id
        const userId = req.user.id
        try {
            if (subreplyId.match(/^[0-9a-fA-F]{24}$/)) {
                const subreply = await subReply.findById(subreplyId);

                if (subreply.likes.filter((like) => like.user.toString() === userId).length > 0) {
                    const removeIndex = subreply.likes.map((l) => l.user.toString()).indexOf(userId);
                    subreply.likes.splice(removeIndex, 1);
                }

                if (subreply.dislike.filter((dislikes) => dislikes.user.toString() === userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Already downvote"
                    })
                }

                await subreply.dislike.unshift({ user: userId })

                await subreply.save()
                return res.status(200).json({
                    status: "success",
                    message: "You successfully downvote"
                })
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
    deleteDownvote: async(req, res) => {
        const subreplyId = req.params.id
        const userId = req.user.id
        try {
            if (subreplyId.match(/^[0-9a-fA-F]{24}$/)) {
                const subreply = await subReply.findById(subreplyId);

                if (subreply.dislike.filter((dislikes) => dislikes.user.toString() === userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "There is no vote"
                    })
                }

                const removeIndex = subreply.dislike.map((d) => d.user.toString()).indexOf(userId);
                subreply.dislike.splice(removeIndex, 1);
                await subreply.save()
                return res.status(200).json({
                    status: "success",
                    message: "You successfully downvote"
                })
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
    }
};