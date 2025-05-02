const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  amount: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', cartSchema);