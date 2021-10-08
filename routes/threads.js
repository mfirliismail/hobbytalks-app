const express = require('express')
const router = express.Router()
const thread = require('../controllers/threads')
const { authToken } = require('../middlewares/auth')

router.post('/create', authToken, thread.createThreads)


module.exports = router