const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { Strategy: OAuth2Strategy } = require('passport-oauth2');
const morgan = require('morgan');
const emailRoutes = require('./routes/emailRoutes');
const config = require('./config/config');
const { findOrCreateUser } = require('./models/userModel');
const { createSubscription } = require('./services/graphService');
const { fetchInitialEmails, saveEmailsToElasticsearch, fetchUserProfile } = require('./services/outlookService');

const app = express();

app.use(
  cors({
    origin: config.frontUrl,
    credentials: true,
  })
);

app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: config.sessionSecret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session(undefined));

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: process.env.OUTLOOK_REDIRECT_URL,
      scope: ['openid', 'profile', 'offline_access', 'https://graph.microsoft.com/Mail.Read'],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      await createSubscription(accessToken);

      profile = await fetchUserProfile(accessToken);

      const { emails, deltaLink } = await fetchInitialEmails(accessToken);
      const user = await findOrCreateUser(profile, accessToken, deltaLink);
      await saveEmailsToElasticsearch(emails, user.id);

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use('/api', emailRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
