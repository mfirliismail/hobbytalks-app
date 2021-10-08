const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const { signUp, login } = require('../controllers/authController')
const auth = require('../middlewares/auth')

// router.get('/', (req, res) => {
//     console.log('running')
// })
router.post('/signup', signUp)
router.post('/login', login)

module.exports = router