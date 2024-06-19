const axios = require('axios');
const config = require('../config/config');
const esClient = require('../config/elasticsearch')

const fetchOutlookEmails = async (accessToken) => {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            '$top': 50,
            '$select': 'id,subject,from,toRecipients,receivedDateTime,isRead',
        },
    });

    return response.data.value;
};

const saveEmailsToElasticsearch = async (emails, userId) => {
    const body = emails.flatMap((email) => [
        { index: { _index: 'emails', _id: email.id } },
        { ...email, userId },
    ]);

    const response = await axios.post(`${config.elasticsearch.host}/_bulk`, body.map(JSON.stringify).join('\n') + '\n', {
        headers: {
            'Content-Type': 'application/x-ndjson',
        },
    });

    const bulkResponse = response.data;
    if (bulkResponse.errors) {
        const erroredDocuments = bulkResponse.items.filter((item) => item.index && item.index.error);

        console.error('Failed to index some documents:', erroredDocuments);
    }
};

const syncEmailData = async (user) => {
    try {
        const emails = await fetchOutlookEmails(user.accessToken);

        await saveEmailsToElasticsearch(emails, user.id);

        console.log(`Successfully synced emails for user: ${user.id}`);
    } catch (error) {
        console.error('Error syncing emails:', error.message);
    }
};

const getEmails = async (user) => {
    try {
        const { body } = await esClient.search({
            index: 'emails',
            body: {
                query: {
                    match: { userId: user.id},
                },
            }
        });

        return body.hits.hits.map((hit) => hit._source);
    } catch (error) {
        console.error('Error fetching emails from Elasticsearch:', error.message);
        throw error;
    }
};

const fetchInitialEmails = async (accessToken) => {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages/delta', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            '$select': 'id,subject,from,toRecipients,receivedDateTime,isRead',
        },
    });

    return {
        emails: response.data.value,
        deltaLink: response.data['@odata.deltaLink'],
    };
};

const fetchDeltaEmails = async (accessToken, deltaLink) => {
    const response = await axios.get(deltaLink, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data.value;
};

const fetchUserProfile = async (accessToken) => {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

module.exports = {
    saveEmailsToElasticsearch,
    syncEmailData,
    getEmails,
    fetchInitialEmails,
    fetchDeltaEmails,
    fetchUserProfile
}
