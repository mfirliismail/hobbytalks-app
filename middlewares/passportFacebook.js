const express = require('express')
const passportFacebook = require("passport");
const cors = require('cors')
const app = express()
const FacebookStrategy = require("passport-facebook").Strategy
require("dotenv").config();

app.use(cors())

passportFacebook.serializeUser(function(user, done) {
    done(null, user);
});

passportFacebook.deserializeUser(function(user, done) {
    done(null, user);
});

passportFacebook.use(
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_AUTH_URI,
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            return cb(null, profile);
        }
    )
);

module.exports = passportFacebook