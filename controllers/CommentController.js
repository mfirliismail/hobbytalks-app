const Reply = require("../models/Reply");
const comment = require("../models/Comment");

module.exports = {
    createComments: async(req, res) => {
        const body = req.body;
        try {
            const reply = await Reply.findById(body.Reply)
            if (!reply) {
                return res.status(404).json({
                    status: "not found",
                    message: "The relpy with given id is not found"
                })
            }
            const saveComment = await comment.create(body);
            await reply.Comments.unshift(saveComment._id)
            await reply.save()
            const getComment = await comment.findById(saveComment.id).populate("reply", ["content", "likes", "dislike", "date"])
                .populate("subReply", ["content", "likes", "dislike", "date"]);
            return res.status(201).json({
                status: "success",
                message: "Comment created successfully",
                data: getComment,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readAllComments: async(req, res) => {
        try {
            const comments = await comment.find().populate("reply", ["content", "likes", "dislike", "date"])
                .populate("subReply", ["content", "likes", "dislike", "date"]);
            return res.status(200).json({
                status: "success",
                message: "Comment retrieved successfully",
                data: comments,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readOneComments: async(req, res) => {
        const id = req.params.id;
        try {
            const comments = await comment.findOne(id).populate("reply", ["content", "likes", "dislike", "date"])
                .populate("subReply", ["content", "likes", "dislike", "date"]);
            return res.status(200).json({
                status: "success",
                message: "Comment retrieved successfully",
                data: comments,
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
        try {
            const updateComment = await comment.findOneAndUpdate({ content: content }, body, {
                    returnOriginal: false
                }).populate("reply", ["content", "likes", "dislike", "date"])
                .populate("subReply", ["content", "likes", "dislike", "date"]);
            return res.status(201).json({
                status: "success",
                message: "Comment updated successfully",
                data: updateComment,
            });
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
        try {
            const deleteComment = await comment.deleteOne({ content: id })
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