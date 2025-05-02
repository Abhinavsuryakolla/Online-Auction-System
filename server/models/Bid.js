const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bid', bidSchema);