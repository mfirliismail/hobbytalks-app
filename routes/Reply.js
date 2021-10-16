const express = require('express')
const router = express.Router()
const reply = require('../controllers/ReplyController')
const { authToken } = require('../middlewares/auth')

router.post("/:commentId", authToken, reply.createReply)
router.get("/:id", reply.readAllReply)
router.put("/:id", authToken, reply.updateReply)
router.delete("/:id", authToken, reply.deleteReply)
router.put("/upvote/:id", authToken, reply.addUpVote)
router.delete("/upvote/:id", authToken, reply.deleteUpVote)
router.put("/downvote/:id", authToken, reply.addDownVote)
router.delete("/downvote/:id", authToken, reply.deleteDownVote)

module.exports = router