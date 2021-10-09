const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const { signUp, login } = require('../controllers/authController')
const { editUser, getProfile, editBanner, getOneUser } = require('../controllers/users')
const { authToken } = require('../middlewares/auth')
const cloudUpload = require('../middlewares/cloudUpload')

// router.get('/', (req, res) => {
//     console.log('running')
// })
router.post('/signup', signUp)
router.post('/login', login)
router.get('/profile/me', authToken, getProfile)
router.put('/edit/profile', authToken, cloudUpload('avatar'), editUser)
router.put('/edit/banner', authToken, cloudUpload('banner'), editBanner)
router.get('/user/:id', getOneUser)

module.exports = router