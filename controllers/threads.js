const Threads = require('../models/Threads')
const joi = require('joi')

module.exports = {
    createThreads: async(req, res) => {
        const { title, content, category } = req.body
        const userId = req.user._id
        try {


        } catch (err) {
            console.log(err)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    }
}