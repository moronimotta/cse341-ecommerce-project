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
    required: [true, 'Amount is required']
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
    // TODO: program will set the date when the order was created
    type: Date,
    default: Date.now,
  }

  // store_id
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;