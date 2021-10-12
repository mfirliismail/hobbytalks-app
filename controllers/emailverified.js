const nodeMailer = require('nodemailer')
const User = require('../models/Users')
const jwt = require

module.exports = {
    sendEmail: async (email, verifCode) => {
        const transporter = nodeMailer.createTransport({
            service: "Gmail",
            auth: {
                user: "HobbyTalkGlints@gmail.com",
                pass: "Hobbytalk14"
            }
        })

        const link = `http://localhost:5000/api/v1/users/verif?email=${email}&verifCode=${verifCode}`
        let mailOptions = {
            from: "HobbyTalkGlints@gmail.com",
            to: `${email}`,
            subject: "verified account Hobby Talks",
            html: "<button><a href="+link+">Click To Verified</a></button>"
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error)
            }else{
                console.log("Message sent: " + info.response)
            }
        })
    },

    verifAcc: async (req, res) => {
        try {
            const {email, verifCode} = req.query

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

            res.status(200).json({ 
                status: "success",
                message: "Account verification success",
                data: User
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