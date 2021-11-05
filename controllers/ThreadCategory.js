const ThreadsCategory= require ('../models/Threads')
module.exports = {
    Threads: async(req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const id = req.params.id
        try {

            const threads = await ThreadsCategory.find({category: id}).sort({date: -1}).populate([{
                path: "userId",
                models: "Users",
                select: {
                    "name": 1,
                    "email": 1,
                    "avatar": 1
                }
            },{
                path: "category",
                models: "Category"
            }, "commentCount", "likeCount", "dislikeCount"]).limit(limit).skip(limit * (page - 1))
            const count = await ThreadsCategory.count({category: id})

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
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
}