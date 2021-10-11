const express = require('express')
const router = express.Router()
const comments = require('../controllers/CommentController')
const { authToken } = require('../middlewares/auth')

router.post("/:threadsId", authToken, comments.createComments)
router.get("/:id", comments.readAllComments)
router.put("/:id", authToken, comments.updateComments)
router.delete("/:id", authToken, comments.deleteComments)

module.exports = router