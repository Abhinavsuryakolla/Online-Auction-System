const Notification = require('../models/Notification');

async function sendNotification(user, message, auction) {
  await Notification.create({ user, message, auction });
}

module.exports = { sendNotification }; 