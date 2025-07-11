const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

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

    // Wallet logic
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find previous highest bid
    const prevBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });
    let blockAmount = amount;
 // The minimum required to be blocked
    if (!prevBid) {
      // First bid: block minValidBid - 1 (which is startPrice)
      blockAmount = minValidBid - 1;
    } else if (prevBid.user.toString() === user._id.toString()) {
      // User is increasing their own bid: block only the difference
      blockAmount = amount - prevBid.amount;
      if (blockAmount <= 0) {
        return res.status(400).json({ error: 'New bid must be higher than your previous bid' });
      }
    } else {
      // New highest bidder: block minValidBid - 1
      blockAmount = minValidBid - 1;
    }
    if (user.wallet < blockAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    user.wallet -= blockAmount;
    await user.save();
    if (prevBid && prevBid.user.toString() !== user._id.toString()) {
      // Unblock previous highest bidder
      const prevUser = await User.findById(prevBid.user);
      if (prevUser) {
        prevUser.wallet += prevBid.amount;
        await prevUser.save();
      }
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

// Get all past bids for the logged-in user
router.get('/user/past', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const query = { user: req.user.id };
    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .populate('auction', 'title endTime status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ total, page: Number(page), limit: Number(limit), bids });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Paginated bids for an auction
router.get('/:auctionId/paginated', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const query = { auction: req.params.auctionId };
    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ total, page: Number(page), limit: Number(limit), bids });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper: End auction, notify winner, unblock others
async function handleAuctionEnd(auctionId) {
  const auction = await Auction.findById(auctionId);
  if (!auction || auction.status !== 'active') return;
  auction.status = 'ended';
  await auction.save();
  const bids = await Bid.find({ auction: auctionId }).sort({ amount: -1 });
  if (bids.length > 0) {
    const winnerBid = bids[0];
    // Notify winner
    await Notification.create({
      user: winnerBid.user,
      message: `Congratulations! You won the auction for ${auction.title}. Please pay the remaining amount.`,
      auction: auction._id,
    });
    // Notify others and unblock their amounts
    for (let i = 1; i < bids.length; i++) {
      const user = await User.findById(bids[i].user);
      if (user) {
        user.wallet += bids[i].amount;
        await user.save();
        await Notification.create({
          user: user._id,
          message: `You were outbid in the auction for ${auction.title}. Your blocked amount has been unblocked.`,
          auction: auction._id,
        });
      }
    }
  }
}

module.exports = router;