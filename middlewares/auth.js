const jwt = require('jsonwebtoken')

//===============================================================================================================
//
//           tinggal pake dan import di router
//
//===============================================================================================================

module.exports = async(req, res, next) => {
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
}