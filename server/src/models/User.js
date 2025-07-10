const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phoneNumber: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  wallet: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err); // Properly forward error to Express
  }
});

userSchema.methods.comparePassword = async function (password) {
  
  if (!password || !this.password) {
    throw new Error('Password or stored password is missing');
  }
  return await bcrypt.compare(password, this.password);
};



module.exports = mongoose.model('User', userSchema);
