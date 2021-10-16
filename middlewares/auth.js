const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

//===============================================================================================================
//
//           tinggal pake dan import di router
//
//===============================================================================================================

module.exports = {
    authToken: async(req, res, next) => {
        const bearerToken = req.header('Authorization')
        try {
            const token = bearerToken.replace("Bearer ", "")
            jwt.verify(token, process.env.PWD_TOKEN, (err, res) => {
                if (err) {
                    return res.status(401).json({
                        status: "failed",
                        message: "Unauthorized"
                    })
                }
                req.user = res
                next()
            })

        } catch (error) {
            res.status(401).json({
                status: "failed",
                message: "Please Log in or register"
            })
        }
    },

    authHash: async(password) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    reject(err)
                }
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(hash)
                })
            })
        })
    },

    generateVerifCode: (length) => {
        var result = ""
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        var charactersLength = characters.length

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random()*charactersLength))
        }
        return result
        console.log("🚀 ~ file: auth.js ~ line 61 ~ generateVerifCode:async ~ result", result)
    }
}