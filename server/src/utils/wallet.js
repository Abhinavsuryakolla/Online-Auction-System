const User = require('../models/User');

async function blockAmount(userId, amount, io = null) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.wallet < amount) throw new Error('Insufficient wallet balance');
  user.wallet -= amount;
  await user.save();
  
  // Emit real-time wallet update if io is provided
  if (io) {
    io.to(userId.toString()).emit('walletUpdate', {
      userId: userId.toString(),
      newBalance: user.wallet,
      change: -amount,
      type: 'blocked'
    });
  }
}

async function unblockAmount(userId, amount, io = null) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.wallet += amount;
  await user.save();
  
  // Emit real-time wallet update if io is provided
  if (io) {
    io.to(userId.toString()).emit('walletUpdate', {
      userId: userId.toString(),
      newBalance: user.wallet,
      change: amount,
      type: 'unblocked'
    });
  }
}

module.exports = { blockAmount, unblockAmount }; 