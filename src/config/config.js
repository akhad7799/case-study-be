require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    outlook: {
        clientID: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        redirectURL: process.env.OUTLOOK_REDIRECT_URL,
    },
    elasticsearch: {
        host: process.env.ELASTICSEARCH_HOST,
    },
    sessionSecret: process.env.SESSION_SECRET,
    frontUrl: process.env.FE_URL,
    DOMAIN: process.env.DOMAIN,
};
