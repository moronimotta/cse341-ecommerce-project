// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  total_price: {
    // TODO: program will calculate the total price based on the items in the cart
    type: Number,
    default: 0,
  },
  created_at: {
    // TODO: program will set the date when the cart was created
    type: Date,
    default: Date.now,
  },
  store_id: {
    // TODO: program will set the store_id from the item in the cart
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
