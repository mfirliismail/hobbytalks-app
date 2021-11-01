const express = require('express')
const passport = require("passport");
const cors = require('cors')
const app = express()
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy
require("dotenv").config();

app.use(cors())

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_AUTH_URI,
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            return cb(null, profile);
        }
    )
);


passport.use(
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_AUTH_URI,
            profileFields: ['id', 'displayName', 'picture.type(large)', 'email']
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            return cb(null, profile);
        }
    )
);

module.exports = passport