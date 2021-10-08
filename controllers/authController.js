const Users = require('../models/Users')
const {authHash} = require('../middlewares/auth')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config()

module.exports = {
    signUp: async (req, res) => {
        try {
            const { email, name, password } = req.body

            const schema = Joi.object({
                name: Joi.string().min(6).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required()
            })

            const {error} = schema.validate({
                name: name,
                email: email,
                password: password
            }, {
                AbortEarly:false
            })

            if(error){
                return res.status(400).json({
                    status: "failed",
                    message: "input uncorrectly",
                    error: error["details"][0]["message"]
                })
            }

            const checkEmail = await Users.findOne({
                email:email
            })

            if(checkEmail) {
                return res.status(400).json({
                    status: "failed",
                    message: `${email} already exists`
                })
            }

            const hashPassword = await authHash(password)

            const signUp = await Users.create({
                name,
                email,
                password: hashPassword
            })

            if(!signUp){
                return res.status(400).json({
                    status: "failed",
                    message: "Cannot Sign Up"
                })
            }

            res.status(200).json({
                status: "Success",
                message: "Succes Sign Up, check your Email",
                data: signUp
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    },

    login : async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const schema = Joi.object({
                email : Joi.string().email().required(),
                password: Joi.string().min(8).required()
            });
            const { error } = schema.validate({ ...req.body });

            if(error) {
                return res.status(400).json({
                    status : "failed",
                    message: "Invalid email or password",
                    error: error["details"][0]["message"]
                })
            }
            const checkEmail = await Users.findOne({
                email: email
            });

            if(!checkEmail) {
                return res.status(400).json({
                    status : "failed",
                    message: "Invalid email or password"
                });
            }
            console.log(checkEmail);
            const checkPassword = await bcrypt.compare(password,
                checkEmail.password);

            if(!checkPassword) {
                return res.status(400).json({
                    status : "failed",
                    message: "Invalid email or password"
                });
            }
            const payload = {
                email: checkEmail.email,
                id: checkEmail._id,
            };
            jwt.sign(payload,process.env.PWD_TOKEN, { expiresIn: 3600*24 }, (err, token) => {
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
    }
}
