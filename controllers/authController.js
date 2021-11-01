const Users = require('../models/Users')
const { authHash, generateVerifCode } = require('../middlewares/auth')
const { sendEmail } = require('./emailverified')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config()

module.exports = {
    signUp: async(req, res) => {
        try {
            // let verifCode = generateVerifCode(10)
            const { email, name, password } = req.body

            const schema = Joi.object({
                name: Joi.string().min(6).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required()
            })

            const { error } = schema.validate({
                name: name,
                email: email,
                password: password
            }, {
                AbortEarly: false
            })

            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "input uncorrectly",
                    error: error["details"][0]["message"]
                })
            }

            const checkEmail = await Users.findOne({
                email: email
            })

            if (checkEmail) {
                return res.status(400).json({
                    status: "failed",
                    message: `This email ${email} address is already associated with another account`
                })
            }

            const hashPassword = await authHash(password)

            const verifCode = generateVerifCode(10)

            const signUp = await Users.create({
                name,
                email,
                avatar: "",
                bio: "",
                password: hashPassword,
                verifCode
            })
            console.log("🚀 ~ file: authController.js ~ line 51 ~ signUp: ~ signUp", signUp)

            if (!signUp) {
                return res.status(400).json({
                    status: "failed",
                    message: "Cannot Sign Up"
                })
            }

            console.log("🚀 ~ file: authController.js ~ line 64 ~ signUp: ~ signUp", signUp)

            sendEmail(email, verifCode)

            res.status(200).json({
                status: "Success",
                message: "Succes Sign Up, check your Email",
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    },

    login: async(req, res, next) => {
        const { email, password } = req.body;
        const body = req.body
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required()
            });

            const { error } = schema.validate({...body });

            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid email or password",
                    error: error["details"][0]["message"]
                })
            }
            const checkEmail = await Users.findOne({
                email: email
            });

            if (!checkEmail) {
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid email or password"
                });
            }
            const checkPassword = await bcrypt.compare(body.password,
                checkEmail.password);

            if (!checkPassword) {
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid email or password"
                });
            }
            const payload = {
                email: checkEmail.email,
                id: checkEmail._id,
            };

            if (!checkEmail.isVerified) {
                return res.status(401).json({
                    message: "Your Email has not been verified. Please check your email"
                })
            }

            jwt.sign(payload, process.env.PWD_TOKEN, { expiresIn: 3600 * 24 }, (err, token) => {
                return res.status(200).json({
                    status: "success",
                    message: "Logged in successfully",
                    data: token,
                });
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    },

    googleLogin: async(req, res) => {
        let payload;
        try {
            const checkEmail = await Users.findOne({
                email: req.user._json.email
            });
            if (checkEmail) {
                payload = {
                    email: checkEmail.email,
                    id: checkEmail.id,
                };
            } else {
                const user = await Users.create({
                    name: req.user._json.name,
                    email: req.user._json.email,
                    avatar: req.user._json.picture,
                    password: "undefined",
                });
                payload = {
                    email: user.email,
                    id: user.id,
                };
            }

            jwt.sign(payload, process.env.PWD_TOKEN, { expiresIn: 3600 * 24 }, (err, token) => {
                return res.redirect('https://dev-hoobytalks.herokuapp.com/account/loading/?token=' + token)
            });
        } catch (error) {
            console.log(error),
                res.sendStatus(500)
        }
    },

    facebookLogin: async(req, res) => {
        let payload;
        try {
            console.log("ini json" , req.user._json)
            const checkEmail = await Users.findOne({
                email: req.user._json.email ? req.user._json.email : req.user._json.id
            });
            if (checkEmail) {
                payload = {
                    email: checkEmail.email,
                    id: checkEmail.id,
                };
            } else {
                const user = await Users.create({
                    name: req.user._json.name,
                    email: req.user._json.email ? req.user._json.email : req.user._json.id,
                    avatar: req.user._json.picture.data.url,
                    password: "undefined",
                });
                payload = {
                    email: user.email,
                    id: user.id,
                };
            }

            jwt.sign(payload, process.env.PWD_TOKEN, { expiresIn: 3600 * 24 }, (err, token) => {
                return res.redirect('https://dev-hoobytalks.herokuapp.com/account/loading/?token=' + token)
            });
        } catch (error) {
            console.log(error),
                res.sendStatus(500)
        }
    },
}