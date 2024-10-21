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
    // TODO: program will calculate the total price based on the items in the cart
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    // TODO: when it's first created it will be 'pending'. Only after the payment is confirmed it will be 'paid'. If the user asks for a refund, it will be 'refund'.
    // TODO: So the user will not change this value
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