const express = require('express')
const Categories = require('../models/Categories')
const router = express.Router()
const userRoute = require('./users')
const categoryRouter = require('./Categories')
const threadRoute = require('./threads')


router.use('/users', userRoute)
router.use('/category', categoryRouter)
router.use('/threads', threadRoute)

module.exports = router