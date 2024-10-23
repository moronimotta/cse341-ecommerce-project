const mongoose = require('mongoose');
const mongodb = require('../data/database');

const productSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    },
  },
  description: {
    type: String,
    default: null,
  },
  updated_at: {
    type: Date,
    required: true,
  },
  brand: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(a) {
        return a >= 0;
      },
      message: '{VALUE} must be a positive number'
    },
  },
});

productSchema.pre('validate', async function(next) {
  try {
    const store = await mongodb.getDb().collection('stores').findOne({ _id: this.store_id });
    if (!store) {
      return next(new Error('store_id does not exist in the stores collection'));
    }
    next(); 
  } catch (error) {
    next(error); 
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;