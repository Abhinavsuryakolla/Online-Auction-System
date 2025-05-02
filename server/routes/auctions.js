const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can create auctions' });
  }
  const { title, description, images, startPrice, startTime, endTime } = req.body;
  try {
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    const auction = new Auction({
      title,
      description,
      images,
      startPrice,
      startTime,
      endTime,
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
    const auctions = await Auction.find({ status: 'active' })
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
    const { title, description, images, startPrice, startTime, endTime } = req.body;
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
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

module.exports = router;