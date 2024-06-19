const esClient = require('../config/elasticsearch')


const findOrCreateUser = async (profile, accessToken, deltaLink) => {
    const userId = profile.id;

    const { body } = await esClient.get({
        index: 'users',
        id: userId,
    }, { ignore: [404] });

    let user;

    if (body.found) {
        user = body._source;
        user.accessToken = accessToken;
    } else {
        user = {
            id: userId,
            displayName: profile.displayName,
            accessToken: accessToken,
            deltaLink: deltaLink ?? null,
        };
    }

    await esClient.index({
        index: 'users',
        id: userId,
        body: user,
    });

    return user;
};

const findUserById = async (userId) => {
    const { body } = await esClient.get({
        index: 'users',
        id: userId,
    }, { ignore: [404] });

    if (body.found) {
        return body._source;
    }

    return null;
};

const updateUser = async (user) => {
    await esClient.index({
        index: 'users',
        id: user.id,
        body: user,
    });
};

module.exports = {
    findOrCreateUser,
    findUserById,
    updateUser,
};