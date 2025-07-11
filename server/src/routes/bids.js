const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { blockAmount, unblockAmount } = require('../utils/wallet');

router.post('/:auctionId', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const io = req.app.get('io');

  console.log('[BID] Incoming bid:', { auctionId: req.params.auctionId, userId: req.user.id, amount });

  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      console.log('[BID] Auction not found:', req.params.auctionId);
      return res.status(404).json({ error: 'Auction not found' });
    }

    const now = new Date();
    if (now < new Date(auction.startTime)) {
      console.log('[BID] Auction not started yet:', auction._id);
      return res.status(400).json({ error: 'Auction has not started' });
    }

    if (now > new Date(auction.endTime) || auction.status !== 'active') {
      console.log('[BID] Auction ended or inactive:', auction._id, auction.status);
      return res.status(400).json({ error: 'Auction has ended' });
    }

    const minValidBid = Math.max(auction.currentBid || 0, auction.startPrice) + 1;
    if (amount <= minValidBid - 1) {
      console.log('[BID] Bid amount too low:', amount, 'minValidBid:', minValidBid);
      return res.status(400).json({ error: 'Bid amount too low' });
    }

    // Wallet logic
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('[BID] User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Find previous highest bid
    const prevBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });
    let blockAmount = amount;
    if (!prevBid) {
      blockAmount = minValidBid - 1;
    } else if (prevBid.user.toString() === user._id.toString()) {
      blockAmount = amount - prevBid.amount;
      if (blockAmount <= 0) {
        console.log('[BID] New bid not higher than previous:', amount, prevBid.amount);
        return res.status(400).json({ error: 'New bid must be higher than your previous bid' });
      }
    } else {
      blockAmount = minValidBid - 1;
    }
    if (user.wallet < blockAmount) {
      console.log('[BID] Insufficient wallet:', user.wallet, 'needed:', blockAmount);
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Block amount for current user
    await blockAmount(user._id, blockAmount, io);
    console.log('[BID] Blocked amount for user:', user._id, blockAmount);

    if (prevBid && prevBid.user.toString() !== user._id.toString()) {
      await unblockAmount(prevBid.user, prevBid.amount, io);
      console.log('[BID] Unblocked previous highest bidder:', prevBid.user, prevBid.amount);
    }

    const bid = new Bid({
      amount,
      user: req.user.id,
      auction: req.params.auctionId,
    });
    await bid.save();
    console.log('[BID] Bid saved:', bid._id);

    auction.currentBid = amount;
    await auction.save();
    console.log('[BID] Auction updated with new currentBid:', auction._id, amount);

    await bid.populate('user', 'name email');

    const bidToEmit = {
      ...bid.toObject(),
      auction: bid.auction.toString(),
    };

    const roomClients = io.sockets.adapter.rooms.get(bid.auction.toString())?.size || 0;
    io.to(bid.auction.toString()).emit('newBid', bidToEmit);
    console.log('[BID] Emitted newBid to room:', bid.auction.toString(), 'clients:', roomClients);
    res.status(201).json(bid);
  } catch (err) {
    console.error('[BID] ERROR:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
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
async function handleAuctionEnd(auctionId, io = null) {
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
        
        // Emit real-time wallet update if io is provided
        if (io) {
          io.to(user._id.toString()).emit('walletUpdate', {
            userId: user._id.toString(),
            newBalance: user.wallet,
            change: bids[i].amount,
            type: 'auction_ended_unblocked'
          });
        }
        
        await Notification.create({
          user: user._id,
          message: `You were outbid in the auction for ${auction.title}. Your blocked amount has been unblocked.`,
          auction: auction._id,
        });
      }
    }
  }
}

module.exports = { router, handleAuctionEnd };