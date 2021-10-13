const express = require('express')
const router = express.Router()
const thread = require('../controllers/threads')
const { authToken } = require('../middlewares/auth')
const cloudUpload = require('../middlewares/cloudUpload')

router.post('/create', authToken, cloudUpload('image'), thread.createThreads)
router.get('/all', thread.readAllThreads)
router.get('/search/:keyword', thread.searchThreads)
router.put('/edit/:id', authToken, thread.updateThreads)
router.delete('/delete/:id', authToken, thread.deleteThreads)
router.get('/get/:id', thread.getOneThread)
router.get('/more/:userId/:threadId', thread.moreFromUser)

router.put('/upvote/:id', authToken, thread.addLikes)
router.delete('/upvote/:id', authToken, thread.deleteLikes)
router.put('/downvote/:id', authToken, thread.addDislike)
router.delete('/downvote/:id', authToken, thread.deleteDislike)

module.exports = router