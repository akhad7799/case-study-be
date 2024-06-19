const express = require('express');
const passport = require('passport');
const emailController = require('../controllers/emailController');

const router = express.Router();

router.get('/auth/outlook', passport.authenticate('oauth2'));
router.get('/auth/outlook/callback',
    passport.authenticate('oauth2', { failureRedirect: '/error' }),
    emailController.addAccount);

router.post('/sync', emailController.syncEmails);
router.get('/emails', emailController.getEmails);

router.post('/webhook', emailController.webhook);

module.exports = router;
