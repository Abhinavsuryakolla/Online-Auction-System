const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const cartRoutes = require('./routes/cart');
const notificationRoutes = require('./routes/notifications');
const { router: bidRoutes, handleAuctionEnd } = require('./routes/bids');

const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://nexora-ashy.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error('Unauthorized'));
  }
  socket.userId = userId;
  next();
});

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Auction System Backend is running');
});

io.on('connection', (socket) => {
  socket.join(socket.userId);

  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
  });

  socket.on('leaveAuction', (auctionId) => {
    socket.leave(auctionId);
  });

  socket.on('disconnect', () => {
  });
});

const closeAuctions = async () => {
  try {
    const now = new Date();
    const auctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now },
    });

    for (const auction of auctions) {
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 })
        .populate('user');

      if (highestBid) {
        auction.winner = highestBid.user;
        auction.status = 'ended';
        await auction.save();

        const notification = new Notification({
          user: highestBid.user._id,
          message: `You won the auction for "${auction.title}"!`,
          auction: auction._id,
        });

        await notification.save();
        io.to(highestBid.user._id.toString()).emit('newNotification', notification);
      }

      io.to(auction._id.toString()).emit('auctionEnded', {
        auctionId: auction._id,
        winner: highestBid?.user?._id,
      });
      
      // Handle unblocking amounts for other bidders
      await handleAuctionEnd(auction._id, io);
    }
  } catch (err) {
    console.error('Error closing auctions:', err.message);
  }
};

setInterval(closeAuctions, 60 * 1000);

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {})
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
});
