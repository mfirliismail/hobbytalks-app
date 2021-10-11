const express = require('express')
const router = express.Router()
const reply = require('../controllers/ReplyController')

router.post("/:commentId", reply.createReply)
router.get("/", reply.readAllReply)
router.get("/:id", reply.readOneReply)
router.put("/:id", reply.updateReply)
router.delete("/:id", reply.deleteReply)

module.exports = router