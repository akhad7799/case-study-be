const config = require('../config');
const { syncEmailData, getEmails } = require('../services/outlookService');

exports.addAccount = (req, res) => {
    res.redirect(config.frontUrl);
};

exports.syncEmails = async (req, res) => {
    try {
        await syncEmailData(req.body);

        res.status(200).json({ message: 'Synchronization complete' });
    } catch (error) {
        res.status(500).json({ message: 'Synchronization failed', error });
    }
};

exports.getEmails = async (req, res) => {
    try {
        const emails = await getEmails(req.user);

        res.status(200).json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Fetching emails failed', error });
    }
};
