const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');

router.post('/:auctionId', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const io = req.app.get('io');

  try {
    console.log('\n=== NEW BID ATTEMPT ===');
    console.log('User:', req.user.id, 'Amount:', amount, 'Auction:', req.params.auctionId);

    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      console.log('Auction not found');
      return res.status(404).json({ error: 'Auction not found' });
    }

    const now = new Date();
    if (now < new Date(auction.startTime)) {
      console.log('Auction not started');
      return res.status(400).json({ error: 'Auction has not started' });
    }

    if (now > new Date(auction.endTime) || auction.status !== 'active') {
      console.log('Auction ended or inactive');
      return res.status(400).json({ error: 'Auction has ended' });
    }

    const minValidBid = Math.max(auction.currentBid || 0, auction.startPrice) + 1;
    console.log('Minimum Valid Bid:', minValidBid);

    if (amount <= minValidBid - 1) {
      console.log('Bid too low - Current:', auction.currentBid, 'Start:', auction.startPrice);
      return res.status(400).json({ error: 'Bid amount too low' });
    }

    console.log('Creating new bid document...');
    const bid = new Bid({
      amount,
      user: req.user.id,
      auction: req.params.auctionId,
    });
    await bid.save();
    console.log('Bid saved:', bid);

    console.log('Updating auction current bid...');
    auction.currentBid = amount;
    await auction.save();
    console.log('Auction updated:', auction);

    console.log('Populating bid user...');
    await bid.populate('user', 'name email');
    console.log('Populated bid:', bid);

    const bidToEmit = {
      ...bid.toObject(),
      auction: bid.auction.toString(),
    };

    // Log number of clients in the room
    const roomClients = io.sockets.adapter.rooms.get(bid.auction.toString())?.size || 0;
    console.log(`Emitting newBid to room ${bid.auction} with ${roomClients} clients:`, bidToEmit);
    io.to(bid.auction.toString()).emit('newBid', bidToEmit);

    console.log('← Sending client response');
    res.status(201).json(bid);
  } catch (err) {
    console.error('!!! ERROR !!!', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    console.log(`Fetched ${bids.length} bids for auction ${req.params.auctionId}`);
    res.json(bids);
  } catch (err) {
    console.error('Error fetching bids:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;