const express = require('express')
const router = express.Router()
const userRoute = require('./users')
const threadRoute = require('./threads')

router.use('/users', userRoute)
router.use('/threads', threadRoute)

module.exports = router