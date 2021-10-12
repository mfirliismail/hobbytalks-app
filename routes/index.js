const express = require('express')
const Categories = require('../models/Categories')
const router = express.Router()
const userRoute = require('./users')
const categoryRouter = require('./Categories')
const threadRoute = require('./threads')
const commentRoute = require('./Comments')
const replyRoute = require('./Reply')
const subReplyRoute = require('./SubReply')


router.use('/users', userRoute)
router.use('/category', categoryRouter)
router.use('/threads', threadRoute)
router.use('/comments', commentRoute)
router.use('/reply', replyRoute)
router.use('/subReply', subReplyRoute)

module.exports = router