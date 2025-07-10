const User = require('../models/User');

async function blockAmount(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.wallet < amount) throw new Error('Insufficient wallet balance');
  user.wallet -= amount;
  await user.save();
}

async function unblockAmount(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.wallet += amount;
  await user.save();
}

module.exports = { blockAmount, unblockAmount }; 