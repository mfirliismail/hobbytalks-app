const express = require('express')
const router = express.Router()
const SubReply = require('../controllers/SubReplyController')
const { authToken } = require('../middlewares/auth')

router.post("/:replyId", authToken, SubReply.createSubReply)
router.get("/", SubReply.readAllSubReply)
router.put("/:id", authToken, SubReply.updateSubReply)
router.delete("/:id", authToken, SubReply.deleteSubReply)

module.exports = router