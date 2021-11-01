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

        // transporter.use(
        //     "compile",
        //     hbs({
        //         viewEngine: {
        //             extname: ".hbs",
        //             partialsDir: '../templates/',
        //             layoutsDir: '../templates/',
        //             defaultLayout: 'email'
        //         },
        //         viewPath: '../templates/',
        //         extName: '.hbs'
        //     })
        // )

        link = `https://hobbytalk-be-glints.herokuapp.com/api/v1/users/verif?email=${email}&verifCode=${verifCode}`
        let mailOptions = {
            from: process.env.EMAIL,
            to: `${email}`,
            subject: "verified account Hobby Talks",
            html: `<div class="card mb-3" style="max-width: 540px; margin-left: auto; margin-right: auto; border: 5px solid #58595B; border-radius:5%;">
                <div class="row no-gutters" style="text-align: center;">
                    <div class="col-md-4" style="text-align: center;">
                        <h1 style="text-align: center;">Hobby Talk</h1>
                        <img src="https://res.cloudinary.com/awhds/image/upload/v1634177847/hobbytalk/Vector_5_ctfkdc.png" class="logo-footer" style="height: 250px;">
                    </div>
                    <div class="col-md-8" style="text-align: center;">
                        <div class="card-body" style="text-align: center;">
                            <hr>
                            <h2 class="card-title">Account Info:</h2>
                            <p class="card-text">Email: ${email}</p>
                        </div>
                        <div class="card-body" style="text-align: center;">
                            <p class="card-text">Please click button for verification</p>
                            <a href="${link}">Click here</a>
                        </div>
                    <h6 style="color: grey; text-align: center;">© Hobby Talk 2021. All rights reserved</h6>
                    </div>
                </div>
            </div>`,
            // context: {
            //     email,
            //     link
            // }
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
            res.redirect('https://dev-hoobytalks.herokuapp.com/account/login')

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "Failed",
                message: "Internal Server Error"
            })
        }
    }
}