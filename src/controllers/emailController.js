const config = require('../config/config');
const { syncEmailData, getEmails, fetchDeltaEmails, saveEmailsToElasticsearch } = require('../services/outlookService');
const { findUserById } = require('../models/userModel');

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

exports.webhook = async (req, res) => {
  const validationToken = req.query.validationToken;

  if (validationToken) {
    res.status(200).send(validationToken);
  } else {
    console.log('Received notification:', req.body);

    const userId = req.body.value[0]?.resourceData?.userId;
    const user = await findUserById(userId);
    const accessToken = user.accessToken;
    const deltaLink = user.deltaLink;

    if (deltaLink) {
      const changes = await fetchDeltaEmails(accessToken, deltaLink);
      await saveEmailsToElasticsearch(changes, user.id);

      console.log('Delta Changes:', changes);
    }

    res.sendStatus(202);
  }
};
