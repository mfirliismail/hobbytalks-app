const express = require('express')
const router = express.Router()
const comments = require('../controllers/CommentController')

router.post("/", comments.createComments)
router.get("/", comments.readAllComments)
router.get("/:id", comments.readOneComments)
router.put("/:id", comments.updateComments)
router.delete("/:id", comments.deleteComments)

module.exports = router