const express = require('express')
const router = express.Router()
const thread = require('../controllers/threads')
const auth = require('../middlewares/auth')

router.post('/create', auth, thread.createThreads)


module.exports = router