const Users = require('../models/Users')
const Category = require('../models/Categories')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require("dotenv").config()


module.exports = {
    getProfile: async(req, res) => {
        const id = req.user.id
        try {
            console.log(req.user)
            const findUser = await Users.findById(id).select('name email avatar banner bio following categoryLike')
                .populate({
                    path: "threads",
                    populate: ([{
                        path: "comment",
                        model: "Comments",
                        populate: ({
                            path: "reply",
                            model: "Reply",
                            populate: ({
                                path: "subReply",
                                model: "SubReply"
                            })
                        })
                    }, {
                        path: "category",
                        models: "Category"
                    }, "commentCount", "likeCount", "dislikeCount"])
                })
            if (!findUser) {
                return res.status(400).json({
                    status: "failed",
                    message: "you are not own this user"
                })
            }

            return res.status(200).json({
                status: "success",
                message: "Success Retrieved Data",
                data: findUser
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    editUser: async(req, res) => {
        const user = req.user
        const body = req.body
        let file

        try {
            console.log(req.file)
            const userFind = await Users.findById(user.id);
            if (!userFind) {
                return res.status(401).json({ msg: "You Don't Owe This User" });
            }
            if (req.file) {
                file = req.file
            } else {
                file = userFind.avatar
            }
            if (!file.path) {
                userFind.avatar = userFind.avatar
            } else {
                userFind.avatar = file.path
            }
            userFind.name = body.name ? body.name : userFind.name
            userFind.password = body.password ? body.password : userFind.password
            userFind.bio = body.bio ? body.bio : userFind.bio

            await userFind.save()
            return res.status(200).json({
                status: "success",
                message: "success edit profile"
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    editBanner: async(req, res) => {
        const user = req.user
        const body = req.body
        const file = req.file
        try {
            console.log(req.file)
            const userFind = await Users.findById(user.id);
            if (!userFind) {
                return res.status(401).json({ msg: "You Don't Owe This User" });
            }
            if (!file) {
                return res.status(400).json({
                    status: "failed",
                    message: "please insert an image"
                })
            }
            userFind.banner = file.path ? file.path : userFind.banner
            await userFind.save()
            return res.status(200).json({
                status: "success",
                message: "success edit banner"
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    getOneUser: async(req, res) => {
        const id = req.params.id
        try {
            const getOne = await Users.findById(id).select('name email avatar banner bio following categoryLike')
                .populate({
                    path: "threads",
                    populate: ([{
                        path: "comment",
                        model: "Comments",
                        populate: ({
                            path: "reply",
                            model: "Reply",
                            populate: ({
                                path: "subReply",
                                model: "SubReply"
                            })
                        })
                    }, {
                        path: "category",
                        models: "Category"
                    }, "commentCount", "likeCount", "dislikeCount"])
                })
            if (!getOne) {
                return res.status(400).json({
                    status: "failed",
                    message: "cannot find user"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Success Retrieved Data",
                data: getOne
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },

    isLikeCategories: async(req, res) => {
        const userId = req.user.id
        const categoriesId = req.body.categoryId

        try {
            const findUser = await Users.findById(userId)

            for (let i = 0; i < categoriesId.length; i++) {
                if (categoriesId[i].match(/^[0-9a-fA-F]{24}$/)) {
                    const findCategory = await Category.findById(categoriesId[i])
                    if (!findCategory) {
                        return res.status(400).json({
                            status: "Failled",
                            message: "cannot found category id"
                        })
                    }

                    if (findUser.categoryLike.filter((e) => e.toString() == categoriesId[i]).length > 0) {
                        return res.status(400).json({
                            status: "failed",
                            message: "like category already"
                        })
                    }
                    console.log("category", categoriesId[i], findUser.categoryLike)

                    findUser.categoryLike.unshift(categoriesId[i].toString())

                    await findUser.save()
                } else {
                    return res.status(400).json({
                        status: "Failled",
                        message: "cannot found category id"
                    })
                }
            }
            return res.status(200).json({
                status: "Success",
                message: "Success add like categories",
                data: findUser
            })

        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    }
}