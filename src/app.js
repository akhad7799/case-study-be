const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const {Strategy: OAuth2Strategy} = require('passport-oauth2');
const emailRoutes = require('./routes/emailRoutes');
const config = require('./config');
const { findOrCreateUser } = require('./models/userModel');
const morgan = require('morgan');

const app = express();

app.use(cors({
    origin: config.frontUrl,
    credentials: true,
}));

app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: config.sessionSecret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session(undefined));

passport.use(new OAuth2Strategy({
        authorizationURL: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`,
        tokenURL: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        clientID: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        callbackURL: process.env.OUTLOOK_REDIRECT_URL,
        scope: ['openid', 'profile', 'offline_access', 'https://graph.microsoft.com/Mail.Read'],
        state: true,
    },
    (accessToken, refreshToken, profile, done) => {
        const user = findOrCreateUser(profile, accessToken);
        // profile.accessToken = accessToken;

        return done(null, user);
    }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use('/api', emailRoutes);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
