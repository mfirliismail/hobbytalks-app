const express = require('express')
const router = express.Router()
const reply = require('../controllers/ReplyController')
const { authToken } = require('../middlewares/auth')

router.post("/:commentId", authToken, reply.createReply)
router.get("/:id", reply.readAllReply)
router.put("/:id", authToken, reply.updateReply)
router.delete("/:id", authToken, reply.deleteReply)

module.exports = router