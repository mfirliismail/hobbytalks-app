const express = require('express')
const router = express.Router()
const thread = require('../controllers/threads')
const { authToken } = require('../middlewares/auth')

router.post('/create', authToken, thread.createThreads)
router.get('/all', authToken, thread.readAllThreads)
router.get('/search/:keyword', authToken, thread.searchThreads)
router.put('/edit/:id', authToken, thread.updateThreads)
router.delete('/delete/:id', authToken, thread.deleteThreads)

module.exports = router