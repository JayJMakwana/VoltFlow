const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

  bookingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },

  amount: {
    type: Number,
    required: true
  },

  taxRate: {
    type: Number,
    default: 18
  },

  taxAmount: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },

  transactionID: {
    type: String,
    required: true
  },

  billGenerated: {
    type: Boolean,
    default: false
  },

  billGeneratedAt: {
    type: Date
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);