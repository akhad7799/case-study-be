const { Client } = require('@elastic/elasticsearch');
const axios = require('axios');
const config = require('../config');

const esClient = new Client({ node: config.elasticsearch.host });

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

exports.syncEmailData = async (user) => {
    try {
        const emails = await fetchOutlookEmails(user.accessToken);

        await saveEmailsToElasticsearch(emails, user.id);

        console.log(`Successfully synced emails for user: ${user.id}`);
    } catch (error) {
        console.error('Error syncing emails:', error.message);
    }
};

exports.getEmails = async (user) => {
    try {
        const { body } = await esClient.search({
            index: 'emails',
            body: {
                query: {
                    match: { userId: '00037ffe-7508-ee0a-0000-000000000000@84df9e7f-e9f6-40af-b435-aaaaaaaaaaaas'},
                },
            }
        });

        return body.hits.hits.map((hit) => hit._source);
    } catch (error) {
        console.error('Error fetching emails from Elasticsearch:', error.message);
        throw error;
    }
};
