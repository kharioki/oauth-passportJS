const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user.id);
    });
});

passport.use(
    new GoogleStrategy({
        // options for the google strategy
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exist in our database
        User.findOne({ googleId: profile.id}).then(currentUser => {
            if(currentUser) {
                // user exists
                console.log({currentUser});
                done(null, currentUser);
            } else {
                // if not, create user
                new User({
                    googleId: profile.id,
                    username: profile.displayName
                }).save().then(newUser => {
                    console.log('new user created: ', newUser);
                    done(null, newUser);
                })
            }
        })
        
    })
);