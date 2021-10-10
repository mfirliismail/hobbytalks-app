const reply = require("../models/Reply");
const subReply = require("../models/SubReply");

module.exports = {
    createSubReply: async(req, res) => {
        const body = req.body;
        try {
            const saveSubReply = await subReplyreply.create(body);
            return res.status(201).json({
                status: "success",
                message: "subReply created successfully",
                data: saveSubReply,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readAllSubReply: async(req, res) => {
        try {
            const subreplies = await reply.find();
            return res.status(200).json({
                status: "success",
                message: "subReplies retrieved successfully",
                data: subreplies,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    readOneSubReply: async(req, res) => {
        const id = req.params.id;
        try {
            const subReply = await reply.findOne(id);

            return res.status(200).json({
                status: "success",
                message: "subReply retrieved successfully",
                data: subReply,
            });
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
        try {
            const updateSubReply = await subReply.findOneAndUpdate({ content: content }, body, {
                returnOriginal: false
            });
            return res.status(201).json({
                status: "success",
                message: "subReply updated successfully",
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
    deleteSubReply: async(req, res) => {
        const id = req.params.id
        try {
            const deleteSubReply = await subReply.deleteOne({ content: id })
            if (!deleteSubReply.deletedCount) {
                return res.status(404).json({
                    status: "failed",
                    message: "subReply doesn't exist"
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