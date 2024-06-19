const axios = require('axios');
const {config} = require('../config/config');

const createSubscription = async (accessToken) => {
    const subscriptionEndpoint = 'https://graph.microsoft.com/v1.0/subscriptions';
    const notificationUrl = `${config.DOMAIN}/api/webhook`; // this doesn't work with localhost, domain should be https

    const subscription = {
        changeType: 'created,updated,deleted',
        notificationUrl: notificationUrl,
        resource: 'me/mailFolders/inbox/messages',
        expirationDateTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    const response = await axios.post(subscriptionEndpoint, subscription, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

module.exports = {
    createSubscription,
};
