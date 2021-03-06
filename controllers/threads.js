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
                content: joi.string(),
                category: joi.string()
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
            user.threads.unshift(createthread._id)
            await user.save()
            return res.status(200).json({
                status: "success",
                message: "success created thread"
            })

        } catch (err) {
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

            const thread = await Threads.find().sort({ date: 1 }).populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, {
                path: "category",
                models: "Category"
            }, "commentCount", "likeCount", "dislikeCount"]).limit(limit).skip(limit * (page - 1))
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
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            });
        } catch (error) {
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
                .populate([{
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }, {
                    path: "category",
                    models: "Category"
                }, "commentCount", "likeCount", "dislikeCount"]).limit(limit).skip(limit * (page - 1))
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
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            })
        } catch (error) {
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
        let file
        try {
            const thread = await Threads.findById(id);
            if (!thread) {
                return res.status(404).json({ msg: 'Thread Not Found' });
            }
            if (thread.userId != user.id) {
                return res.status(401).json({ msg: "You Don't Owe This threads" });
            }
            const threads = await Threads.findById(id);
            if (req.file) {
                file = req.file
            } else {
                file = threads.image
            }
            if (!file.path) {
                threads.image = threads.image
            } else {
                threads.image = file.path
            }
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
                
                if (findthread.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads already liked"
                    })
                }
                if (findthread.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    const removeIndex = findthread.dislike.map((d) => d.user.toString()).indexOf(userId);
                    findthread.dislike.splice(removeIndex, 1);
                }

                findthread.likes.unshift({ user: userId })

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
                if (findthread.likes.filter((e) => e.user.toString() == userId).length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads has not been liked"
                    })
                }
                const removeIndex = findthread.likes.map((like) => like.user.toString()).indexOf(userId);
                findthread.likes.splice(removeIndex, 1);
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
                if (findthread.dislike.filter((e) => e.user.toString() == userId).length > 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads already disliked"
                    })
                }
                if (findthread.likes.filter((e) => e.user.toString() == userId).length > 0) {
                    const removeIndex = findthread.likes.map((l) => l.user.toString()).indexOf(userId);
                    findthread.likes.splice(removeIndex, 1);
                }

                findthread.dislike.unshift({ user: userId })

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
                if (findthread.dislike.filter((e) => e.user.toString() == userId).length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads has not been disliked"
                    })
                }
                const removeIndex = findthread.dislike.map((d) => d.user.toString()).indexOf(userId);
                findthread.dislike.splice(removeIndex, 1);
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
                const findThread = await Threads.findById(id).populate([{
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
                        }, "subReplyCount", "likeCount", "dislikeCount"])
                    }, {
                        path: "userId",
                        models: "Users",
                        select: {
                            "name": 1,
                            "email": 1,
                            "avatar": 1
                        }
                    }, "replyCount", "likeCount", "dislikeCount"])
                }, {
                    path: "category",
                    models: "Category"
                }, ]).populate({
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }).populate(["commentCount", "likeCount", "dislikeCount"])
                if (!findThread) {
                    return res.status(400).json({
                        status: 'failed',
                        message: 'cannot found thread'
                    })
                }
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
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    getThreadNewest: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        try {
            const thread = await Threads.find().sort({ date: -1 }).populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, {
                path: "category",
                models: "Category"
            }, "commentCount", "likeCount", "dislikeCount"]).limit(limit).skip(limit * (page - 1))
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
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    moreFromUser: async(req, res) => {
        const threadId = req.params.threadId
        try {
            if (threadId.match(/^[0-9a-fA-F]{24}$/)) {
                const findUserThread = await Threads.findById(threadId)
                const threads = await Threads.find({ userId: findUserThread.userId, _id: { $ne: threadId } }).sort({ date: -1}).populate(['commentCount', "likeCount", "dislikeCount"]).limit(3)
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
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    getThreadTrending: async(req, res) => {
        const limit = 7
        try {
            const thread = await Threads.find().populate([{
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    },
                    // options: {
                    //     sort: { likes: 1 }
                    // }
                }, "commentCount", "likeCount", "dislikeCount"])
                .select(["title", "likes", "likeCount"])

            thread.sort((a, b) => b.likeCount - a.likeCount)

            const showThread = []
            for (let i = 0; i < 7; i++) {
                showThread.push(thread[i])
            }
            return res.status(200).json({
                status: "success",
                message: "Data retrieved successfully",
                data: showThread
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    getThreadMostPopular: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        try {

            const thread = await Threads.find().populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, {
                path: "category",
                models: "Category"
            }, "commentCount", "likeCount", "dislikeCount"])

            thread.sort((a, b) => b.likeCount - a.likeCount)
            for (let i = 0; i < thread.length; i++) {
                if (i == 0) {
                    thread[i].status = "Popular"
                    thread[i].save()
                } else {
                    thread[i].status = "none"
                    thread[i].save()
                }
            }
            const start = (page - 1) * limit
            const end = limit + start
            const pageLimit = thread.slice(start, end)
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
                data: pageLimit,
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    mightLike: async(req, res) => {
        const userId = req.user.id
        
        try {
            const findUser = await Users.findById(userId)
            const categoryLikes = findUser.categoryLike
            
            const show = await Threads.find().where("category").in(categoryLikes)
            let random = parseInt(Math.floor(Math.random() * show.length))
            const showThread = await Threads.find().where("category").in(categoryLikes).skip(random).limit(4).populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, {
                path: "category",
                models: "Category"
            }, "commentCount", "likeCount", "dislikeCount"])
            return res.status(200).json({
                status: "Success",
                message: "Success retrieved data",
                data: showThread
            })
           
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    getThreadHot: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const date = new Date()
        try {
            const thread = await Threads.find().populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, {
                path: "category",
                models: "Category"
            }, "comment", "commentCount", "likeCount", "dislikeCount"])
            let sekarang = date.getTime()
            let setelah = date.setTime(date.getTime() - (12 * 60 * 60 * 1000))
            let skrng = new Date(sekarang)
            let stlh = new Date(setelah)
            for (let i = 0; i < thread.length; i++) {
                // let hasil = thread[i].likes.length + thread[i].dislike.length + thread[i].comment.length
                let hasil
                let upvoteJumlah = thread[i].likes.filter(e => e['date'] > stlh)
                let downvoteJumlah = thread[i].dislike.filter(e => e['date'] > stlh)
                let commentJumlah = thread[i].comment.filter(e => e['date'] > stlh)
                hasil = upvoteJumlah.length + downvoteJumlah.length + commentJumlah.length
                thread[i].total = hasil

                await thread[i].save()
            }


            const threads = await Threads.find().sort({ total: -1 }).populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            }, "commentCount", "likeCount", "dislikeCount"]).limit(limit).skip(limit * (page - 1))
            for (let i = 0; i < threads.length; i++) {
                if (page > 1) {
                    threads[i].status = "none"
                    await threads[i].save()
                } else {
                    threads[i].status = "none"
                    threads[0].status = "Hot"
                    await threads[i].save()
                }

            }
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
                data: threads,
                totalPage: total,
                nextPage: next,
                currentPage: page,
                previousPage: previous
            });


        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    relatedTopic: async(req, res) => {
        const limit = 4
        const id = req.params.id
        try {
            const findThread = await Threads.findById(id)
            if (!findThread) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot found thread"
                })
            }

            const related = await Threads.find({ category: findThread.category, _id: { $ne: id } }).populate([{
                    path: "userId",
                    models: "Users",
                    select: {
                        "name": 1,
                        "email": 1,
                        "avatar": 1
                    }
                }, "commentCount", "likeCount", "dislikeCount"]).limit(limit)

            return res.status(200).json({
                status: "success",
                message: "Data retrieved successfully",
                data: related,
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    followThread: async(req, res) => {
        const threadId = req.params.id
        const userId = req.user.id
        try {
            if (threadId.match(/^[0-9a-fA-F]{24}$/)) {
                const findUser = await Users.findById(userId)
                if (!findUser) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found user"
                    })
                }
                const findThread = await Threads.findById(threadId)
                
                if (findThread.userId.toString() != userId) {
                    if (findUser.following.filter((e) => e.toString() == threadId).length > 0) {
                        return res.status(400).json({
                            status: "failed",
                            message: "threads already followed"
                        })
                    }

                    findUser.following.unshift(threadId)

                    await findUser.save()
                    return res.status(200).json({
                        status: "success",
                        message: "success following thread"
                    })
                }
                return res.status(400).json({
                    status: "failed",
                    message: "You cannot follow your own thread"
                })

            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "User not match"
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
    unfollowThread: async(req, res) => {
        const threadId = req.params.id
        const userId = req.user.id
        try {
            if (threadId.match(/^[0-9a-fA-F]{24}$/)) {
                const findUser = await Users.findById(userId)
                if (!findUser) {
                    return res.status(400).json({
                        status: "failed",
                        message: "cannot found user"
                    })
                }
                if (findUser.following.filter((e) => e.toString() == threadId).length == 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "threads has not been followed"
                    })
                }

                findUser.following.pull(threadId)

                await findUser.save()
                return res.status(200).json({
                    status: "success",
                    message: "success unfollowing thread"
                })
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "User not match"
                })
            }

        } catch (error) {
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    },
    getfollowThread: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const userId = req.user.id
        try {
            const findUserLimit = await Users.findById(userId).populate([{
                path: "following",
                models: "Threads",
                options: {
                    limit: limit,
                    skip: limit * (page - 1)
                },
                populate: ([{
                    path: "category",
                    models: "Category"
                }, {
                    path: "userId",
                    models: "Users",
                    select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                    }
                }, "commentCount", "likeCount", "dislikeCount"])
            }])
            const findUser = await Users.findById(userId).populate([{
                path: "following",
                models: "Threads",
                populate: ([{
                    path: "category",
                    models: "Category"
                }, "commentCount", "likeCount", "dislikeCount"])
            }])
            const followingThread = findUserLimit.following
            const count = findUser.following.length

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
            if (followingThread.length == 0) {
                return res.status(400).json({
                    status: "failed",
                    message: "You haven't follow any threads"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "success retrieved thread that you follow",
                data: followingThread,
                nextPage: next,
                previousPage: previous,
                currentPage: page,
                totalPage: total
            })
        } catch (error) {
            return res.status(500).json({
                status: 'failed',
                message: "Internal Server Error"
            })
        }
    }
}