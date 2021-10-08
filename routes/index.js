const express = require('express')
const Categories = require('../models/Categories')
const router = express.Router()
const userRoute = require('./users')
const categoryRouter = require('./Categories')


router.use('/users', userRoute)
router.use('/category',categoryRouter)



module.exports = router