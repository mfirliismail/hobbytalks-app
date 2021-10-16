const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const { signUp, login, googleLogin, googleToken } = require('../controllers/authController')
const passport = require('../middlewares/passport')
const { editUser, getProfile, editBanner, getOneUser, isLikeCategories } = require('../controllers/users')
const { authToken } = require('../middlewares/auth')
const cloudUpload = require('../middlewares/cloudUpload')
const { verifAcc } = require('../controllers/emailverified')

// router.get('/', (req, res) => {
//     console.log('running')
// })
router.post('/signup', signUp)
router.post('/login', login)
router.get('/verif', verifAcc)
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/failed", (req, res) => res.send("Failed to login, please try again"));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/v1/users/failed" }), googleLogin);
router.get('/profile/me', authToken, getProfile)
router.put('/likecategories', authToken, isLikeCategories)
router.put('/edit/profile', authToken, cloudUpload('avatar'), editUser)
router.put('/edit/banner', authToken, cloudUpload('banner'), editBanner)
router.get('/user/:id', getOneUser)

module.exports = router