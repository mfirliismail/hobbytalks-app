const subReply = require("../models/SubReply");
const reply = require("../models/Reply");
const comment = require("../models/Comment");
const thread = require("../models/Threads")

module.exports = {
    createReply: async(req, res) => {
        const body = req.body;
        const id = req.params.commentId;
        const userId = req.user.id;
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const findComment = await comment.findById(id);
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
        try {
            const replies = await reply.find();
            return res.status(200).json({
                status: "success",
                message: "Replies retrieved successfully",
                data: replies,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readOneReply: async(req, res) => {
        const id = req.params.id;
        try {
            const Reply = await reply.findOne(id);

            return res.status(200).json({
                status: "success",
                message: "Reply retrieved successfully",
                data: Reply,
            });
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
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateReply = await reply.findOneAndUpdate({ id: content }, body, {
                    returnOriginal: false
                });
                return res.status(201).json({
                    status: "success",
                    message: "Reply updated successfully",
                    data: updateReply,
                });
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
        try {
            const paramId = await comment.findById(id)
            if (paramId == null) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot delete"
                })
            }
            const threads = await thread.findById(paramId.threadId)
            await threads.comment.shift(id)
            await threads.save()
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
};