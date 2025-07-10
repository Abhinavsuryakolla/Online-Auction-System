const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can create auctions' });
  }
  const { title, description, images, startPrice, startTime, endTime, category } = req.body;
  try {
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    // Deduct 5% commission from seller's wallet
    const User = require('../models/User');
    const seller = await User.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    const commission = Math.round(Number(startPrice) * 0.05 * 100) / 100; // 5% commission, rounded to 2 decimals
    if (seller.wallet < commission) {
      return res.status(400).json({ error: `Insufficient wallet balance. 5% commission (${commission}) required.` });
    }
    seller.wallet -= commission;
    await seller.save();
    const auction = new Auction({
      title,
      description,
      images,
      startPrice,
      startTime,
      endTime,
      category,
      seller: req.user.id,
    });
    await auction.save();
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const auctions = await Auction.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('seller', 'name email');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.seller.toString() !== req.user.id || req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Cannot edit ended auction' });
    }
    const { title, description, images, startPrice, startTime, endTime, category } = req.body;
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    if (category) auction.category = category;
    auction.title = title || auction.title;
    auction.description = description || auction.description;
    auction.images = images || auction.images;
    auction.startPrice = startPrice || auction.startPrice;
    auction.startTime = startTime || auction.startTime;
    auction.endTime = endTime || auction.endTime;
    await auction.save();
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.seller.toString() !== req.user.id || req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (auction.currentBid > 0) {
      return res.status(400).json({ error: 'Cannot delete auction with bids' });
    }
    await auction.remove();
    res.json({ message: 'Auction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get past auctions for a user with pagination
router.get('/user/past', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const query = {
      $or: [
        { winner: req.user.id },
        { seller: req.user.id, status: 'ended' }
      ]
    };
    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query)
      .sort({ endTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ total, page: Number(page), limit: Number(limit), auctions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;