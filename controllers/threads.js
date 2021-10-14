const Threads = require('../models/Threads')
const Comments = require('../models/Comment')
const Reply = require('../models/Reply')
const SubReply = require('../models/SubReply')
const Users = require('../models/Users')
const joi = require('joi')

module.exports = {
    createThreads: async(req, res) => {
        const { title, content, category } = req.body
        const userId = req.user.id
        const file = req.file
        try {
            const schema = joi.object({
                title: joi.string(),
                content: joi.string()
            })
            const { error } = schema.validate({...req.body }, { aboutEarly: false })
            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "please input correctly",
                    error: error['details'][0]['message']
                })
            }
            const user = await Users.findById(userId)

            const createthread = await Threads.create({
                userId: userId,
                title,
                content,
                category,
                image: file.path
            })
            if (!createthread) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot create thread"
                })
            }
            await user.threads.unshift(createthread._id)
            await user.save()
            return res.status(200).json({
                status: "success",
                message: "success created thread"
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    readAllThreads: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        try {

            const thread = await Threads.find().populate({
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }).limit(limit).skip(limit * (page - 1))
            const comments = await Comments.find({ threadId: thread.id })
            const count = await Threads.count()

            let next = page + 1
            if (page * limit >= count) {
                next = 0
            }
            let previous = 0
            if (page > 1) {
                previous = page - 1
            }
            let total = Math.ceil(count / limit)

            if (page > total) {
                return res.status(400).json({
                    status: "failed",
                    message: "page doesnt exist"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Data retrieved successfully",
                data: thread,
                totalComment: comments.length,
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    searchThreads: async(req, res) => {
        const keyword = req.params.keyword;
        const page = parseInt(req.query.page) || 1
        const limit = 4
        try {
            const threads = await Threads.find({ "title": { $regex: new RegExp(keyword, "gi") } })
                .populate({
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }).limit(limit).skip(limit * (page - 1))
            const comments = await Comments.find({ threadId: threads.id })
            const count = await Threads.count({ "title": { $regex: new RegExp(keyword, "gi") } })

            let next = page + 1
            if (page * limit >= count) {
                next = 0
            }
            let previous = 0
            if (page > 1) {
                previous = page - 1
            }
            let total = Math.ceil(count / limit)

            if (page > total) {
                return res.status(400).json({
                    status: "failed",
                    message: "page doesnt exist"
                })
            }
            if (threads.length == 0) {
                return res.status(400).json({
                    status: "failed",
                    message: "there's no threads title like that"
                })
            }

            res.status(200).json({
                status: "success",
                data: threads,
                totalComments: comments.length,
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    deleteThreads: async(req, res) => {
        const id = req.params.id
        const user = req.user
        try {
            const thread = await Threads.findById(id);
            if (!thread) {
                return res.status(404).json({ msg: 'Thread Not Found' });
            }
            if (thread.userId != user.id) {
                return res.status(401).json({ msg: "You Don't Owe This threads" });
            }

            await Threads.findByIdAndRemove(id);
            res.status(200).json({
                status: "success",
                message: "Thread Removed"
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    updateThreads: async(req, res) => {
        const id = req.params.id
        const body = req.body
        const user = req.user
        try {
            const thread = await Threads.findById(id);
            if (!thread) {
                return res.status(404).json({ msg: 'Thread Not Found' });
            }
            if (thread.userId != user.id) {
                return res.status(401).json({ msg: "You Don't Owe This threads" });
            }
            const threads = await Threads.findById(id);
            threads.title = body.title ? body.title : threads.title
            threads.content = body.content ? body.content : threads.content
            threads.category = body.category ? body.category : threads.category

            await threads.save()

            return res.status(200).json({
                status: "success",
                message: "Updated Thread"
            })
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    addLikes: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findthread = await Threads.findById(id)
                if (!findthread) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findthread.likes.filter((e) => e.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads already liked"
                    })
                }
                if (findthread.dislike.filter((e) => e.toString() == userId).length > 0) {
                    findthread.dislike.pull(userId)
                }

                await findthread.likes.unshift(userId)

                await findthread.save()
                return res.status(200).json({
                    status: "success",
                    message: "success like thread"
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
    deleteLikes: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findthread = await Threads.findById(id)
                if (!findthread) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findthread.likes.filter((e) => e.toString() == userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads has not been liked"
                    })
                }

                await findthread.likes.pull(userId)

                await findthread.save()
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
    addDislike: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findthread = await Threads.findById(id)
                if (!findthread) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findthread.dislike.filter((e) => e.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads already disliked"
                    })
                }
                if (findthread.likes.filter((e) => e.toString() == userId).length > 0) {
                    findthread.likes.pull(userId)
                }

                await findthread.dislike.unshift(userId)

                await findthread.save()
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
    deleteDislike: async(req, res) => {
        const id = req.params.id
        const userId = req.user.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findthread = await Threads.findById(id)
                if (!findthread) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found thread"
                    })
                }
                if (findthread.dislike.filter((e) => e.toString() == userId).length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads has not been disliked"
                    })
                }

                await findthread.dislike.pull(userId)

                await findthread.save()
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
    },
    getOneThread: async(req, res) => {
        const id = req.params.id
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const findThread = await Threads.findById(id).populate({
                    path: "comment",
                    populate: ([{
                        path: "reply",
                        model: "Reply",
                        populate: ([{
                            path: "subReply",
                            model: "SubReply",
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
                    }, {
                        path: "userId",
                        models: "Users",
                        select: {
                            "name": 1,
                            "email": 1,
                            "avatar": 1
                        }
                    }])
                }).populate({
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }).populate("commentCount")
                if (!findThread) {
                    return res.status(400).json({
                        status: 'failed',
                        message: 'cannot found thread'
                    })
                }
                console.log(findThread.commentCount)
                findThread.commentSum = findThread.commentCount

                return res.status(200).json({
                    status: "success",
                    message: "success retrieved data",
                    data: findThread
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
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    moreFromUser: async(req, res) => {
        const id = req.params.userId
        const threadId = req.params.threadId
        try {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const threads = await Threads.find({ userId: id, _id: { $ne: threadId } }).populate('comment').limit(3)
                if (!threads) {
                    return res.status(400).json({
                        status: 'failed',
                        message: "theres no thread from user"
                    })
                }

                return res.status(200).json({
                    status: "success",
                    message: "Success retrieved data",
                    data: threads
                })
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Thread not match"
                })
            }
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    }
}