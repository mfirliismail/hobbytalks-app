const comment = require("../models/Comment")
module.exports = {
    addLikes: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findComment = await comment.findById(id)
                if (!findComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found comment"
                    })
                }
                if (findComment.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Comment already liked"
                    })
                }
                if (findComment.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    findComment.dislike.pull({ user: userId })
                }

                await findComment.likes.unshift({ user: userId })

                await findComment.save()
                return res.status(200).json({
                    status: "success",
                    message: "success like Comment"
                })
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not match"
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
    deleteLikes: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findComment = await comment.findById(id)
                if (!findComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found Comment"
                    })
                }
                if (findComment.likes.filter((e) => e.user.toString() == userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Comment has not been liked"
                    })
                }

                await findComment.likes.pull({ user: userId })

                await findComment.save()
                return res.status(200).json({
                    status: "success",
                    message: "success delete like"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not match"
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
    addDislike: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findComment = await comment.findById(id)
                if (!findComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found Comment"
                    })
                }
                if (findComment.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Comment already disliked"
                    })
                }
                if (findComment.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    findComment.likes.pull({ user: userId })
                }

                await findComment.dislike.unshift({ user: userId })

                await findComment.save()
                return res.status(200).json({
                    status: "success",
                    message: "success dislike Comment"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not match"
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
    deleteDislike: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findComment = await comment.findById(id)
                if (!findComment) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found Comment"
                    })
                }
                if (findComment.dislike.filter((e) => e.user.toString() == userId).length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Comment has not been disliked"
                    })
                }

                await findComment.dislike.pull({ user: userId })

                await findComment.save()
                return res.status(200).json({
                    status: "success",
                    message: "success delete dislike"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Comment not match"
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
}