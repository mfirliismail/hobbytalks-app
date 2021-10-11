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
        const id = req.params.replyId
        try {
            const subreplies = await subReply.find({ replyId: id }).populate({
                path: 'userId',
                model: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            })
            if (!subreplies) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot find reply"
                })
            }
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
    updateSubReply: async(req, res) => {
        const content = req.params.id;
        const body = req.body;
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // Yes, it's a valid ObjectId, proceed with `findById` call.
                const updateSubReply = await subReply.findOneAndUpdate({ id: content, userId: userId }, body, {
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
    deleteSubReply: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            const paramId = await reply.findOne({ id: id, userId: userId })
            if (paramId == null) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot delete"
                })
            }
            const replys = await reply.findById(paramId.threadId)
            await replys.subReply.shift(id)
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
};