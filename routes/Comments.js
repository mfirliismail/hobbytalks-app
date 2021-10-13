const express = require('express')
const router = express.Router()
const comments = require('../controllers/CommentController')
const { authToken } = require('../middlewares/auth')
const like = require('../controllers/upvoteComment')

router.post("/:threadsId", authToken, comments.createComments)
router.get("/:id", comments.readAllComments)
router.put("/:id", authToken, comments.updateComments)
router.delete("/:id", authToken, comments.deleteComments)
router.put('/upvote/:id', authToken, like.addLikes)
router.delete('/upvote/:id', authToken, like.deleteLikes)
router.put('/downvote/:id', authToken, like.addDislike)
router.delete('/downvote/:id', authToken, like.deleteDislike)

module.exports = router