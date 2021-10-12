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
                content
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
    }
}