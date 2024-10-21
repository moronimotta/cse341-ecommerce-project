const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: String,
    // required: [true, 'User ID is required'],
  },
  cart_id: {
    type: String,
    // required: [true, 'Cart ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['paid', 'refund', 'pending'],
      message: '{VALUE} is not a valid status'
    },
    required: [true, 'Status is required']
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;