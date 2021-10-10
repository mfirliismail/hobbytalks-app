const express = require('express')
const router = express.Router()
const SubReply = require('../controllers/SubReplyController')

router.post("/", SubReply.createSubReply)
router.get("/", SubReply.readAllSubReply)
router.get("/:id", SubReply.readOneSubReply)
router.put("/:id", SubReply.updateSubReply)
router.delete("/:id", SubReply.deleteSubReply)

module.exports = router