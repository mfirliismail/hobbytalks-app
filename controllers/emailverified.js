const nodeMailer = require('nodemailer')
const User = require('../models/Users')
const hbs = require('nodemailer-express-handlebars')
const Jwt = require('jsonwebtoken')

module.exports = {
    sendEmail: async(email, verifCode) => {
        let link

        const transporter = nodeMailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS_EMAIL
            }
        })

        transporter.use(
            "compile",
            hbs({
                viewEngine: {
                    extname: ".hbs",
                    partialsDir: '../templates/',
                    layoutsDir: '../templates/',
                    defaultLayout: 'email'
                },
                viewPath: '../templates/',
                extName: '.hbs'
            })
        )

        link = `https://hobbytalk-be-glints.herokuapp.com/api/v1/users/verif?email=${email}&verifCode=${verifCode}`
        let mailOptions = {
            from: process.env.EMAIL,
            to: `${email}`,
            subject: "verified account Hobby Talks",
            template: `email`,
            context: {
                email,
                link
            }
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log("Message sent: " + info.response)
            }
        })
    },

    verifAcc: async(req, res) => {
        try {
            const { email, verifCode } = req.query

            const user = await User.findOne({
                email: email,
                verifCode: verifCode
            })

            if (!user) {
                return res.status(400).json({
                    status: "success",
                    message: "email unvalid"
                })
            }

            if (user.verifCode !== verifCode) {
                return res.status(400).json({
                    message: "verif code unvalid"
                })
            }

            user.isVerified = true
            await user.save()

            //mengubah jadi token
            const payload = {
                id: user._id,
                email: user.email
            }

            //method sign dari jwt
            Jwt.sign(payload, process.env.PWD_TOKEN, { expiresIn: 3600 * 24 }, (error, token) => {
                res.status(200).json({
                    status: "success",
                    message: "Account verification success",
                    data: token
                })
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    }
}