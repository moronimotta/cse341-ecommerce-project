const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['paid', 'refund', 'pending'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  cart_id: {
    type: String,
    required: true,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
