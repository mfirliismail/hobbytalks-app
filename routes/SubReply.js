const express = require('express')
const router = express.Router()
const SubReply = require('../controllers/SubReplyController')
const { authToken } = require('../middlewares/auth')

router.post("/:replyId", authToken, SubReply.createSubReply)
router.get("/:replyId", SubReply.readAllSubReply)
router.put("/:id", authToken, SubReply.updateSubReply)
router.delete("/:id", authToken, SubReply.deleteSubReply)
router.put("/upvote/:id", authToken, SubReply.upvoteSubReply)
router.delete("/upvote/:id", authToken, SubReply.deleteUpvote)
router.put("/downvote/:id", authToken, SubReply.downVoteSubReply)
router.delete("/downvote/:id", authToken, SubReply.deleteDownvote)

module.exports = router