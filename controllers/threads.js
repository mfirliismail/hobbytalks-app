const Threads = require('../models/Threads')
const joi = require('joi')

module.exports = {
    createThreads: async(req, res) => {
        const { title, content, category } = req.body
        const userId = req.user._id
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
    }
}