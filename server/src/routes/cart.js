const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

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
  const { cartItemIds, address } = req.body; // cartItemIds: array of cart item IDs
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch all cart items
    const cartItems = await Cart.find({ _id: { $in: cartItemIds }, user: req.user.id }).populate('auction');
    if (cartItems.length === 0) return res.status(400).json({ error: 'No valid cart items' });

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.amount, 0);

    if (user.wallet < total) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    user.wallet -= total;
    await user.save();

    // Create orders and remove cart items
    const orders = [];
    for (const cart of cartItems) {
      const order = new Order({
        user: user._id,
        auction: cart.auction._id,
        amount: cart.amount,
        address,
        paymentStatus: 'completed',
        paymentId: `fake_payment_${Math.random().toString(36).substr(2, 9)}`,
      });
      await order.save();
      await cart.deleteOne();
      orders.push(order);
    }

    res.json({ message: 'Payment successful', orders, wallet: user.wallet });
  } catch (err) {
    console.error('[ERROR] /checkout failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders for the logged-in user
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('auction');
    res.json(orders);
  } catch (err) {
    console.error('[ERROR] /orders failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    if (cartItem.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this cart item' });
    }
    await cartItem.deleteOne(); // Use deleteOne instead of remove
    res.json({ message: 'Cart item deleted' });
  } catch (err) {
    console.error('Cart delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;