const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const { signUp, login, googleLogin } = require('../controllers/authController')
const passport = require('../middlewares/passport')

// router.get('/', (req, res) => {
//     console.log('running')
// })
router.post('/signup', signUp)
router.post('/login', login)
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/failed", (req, res)=> res.send("Failed to login, please try again"));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/v1/users/failed"}), googleLogin);

module.exports = router