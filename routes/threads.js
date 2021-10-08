const express = require('express')
const router = express.Router()
const thread = require('../controllers/threads')


router.post('/create', thread.createThreads)


module.exports = router