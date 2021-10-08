const { Users } = require('../models')
const {authHash} = require('../middlewares/auth')
const Joi = require('joi')

module.exports = {
    signUp: async (req, res) => {
        try {
            const { email, name, password } = req.body

            const schema = await Joi.object({
                name: Joi.string().min(6).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required()
            })

            const {error} = await schema.validate({
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
                    error: error["detail"][0]["message"]
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
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    }
}
