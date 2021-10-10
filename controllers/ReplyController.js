const subReply = require("../models/SubReply");
const reply = require("../models/Reply");

module.exports = {
    createReply: async(req, res) => {
        const body = req.body;
        try {
            const saveReply = await reply.create(body);
            return res.status(201).json({
                status: "success",
                message: "Reply created successfully",
                data: saveReply,
            });
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
            const updateReply = await reply.findOneAndUpdate({ content: content }, body, {
                returnOriginal: false
            });
            return res.status(201).json({
                status: "success",
                message: "Reply updated successfully",
                data: updateReply,
            });
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
            const deleteReply = await reply.deleteOne({ content: id })
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