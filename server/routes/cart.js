const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user.id }).populate('auction', 'title');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { auctionId } = req.body;
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== 'ended' || auction.winner.toString() !== req.user.id) {
      return res.status(400).json({ error: 'Invalid auction or not the winner' });
    }
    const cartItem = new Cart({
      user: req.user.id,
      auction: auctionId,
      amount: auction.currentBid,
    });
    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/checkout', authMiddleware, async (req, res) => {
  const { cartId, address } = req.body;
  try {
    const cart = await Cart.findById(cartId).populate('auction');
    if (!cart || cart.user.toString() !== req.user.id) {
      return res.status(400).json({ error: 'Invalid cart item' });
    }
    const fakePaymentId = `fake_payment_${Math.random().toString(36).substr(2, 9)}`;
    const order = new Order({
      user: req.user.id,
      auction: cart.auction._id,
      amount: cart.amount,
      address,
      paymentStatus: 'completed',
      paymentId: fakePaymentId,
    });
    await order.save();
    await cart.remove();
    res.json({ message: 'Payment successful', orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;