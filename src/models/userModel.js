const users = new Map();

exports.findOrCreateUser = (profile, accessToken) => {
    let user = users.get(profile.id);

    if (!user) {
        user = { id: profile.id, accessToken, emails: [] };
        users.set(profile.id, user);
    } else {
        user.accessToken = accessToken;
    }

    return user;
};
