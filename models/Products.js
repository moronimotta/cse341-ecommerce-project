const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: null, // Nullable
  },
  brand: {
    type: String,
    default: null, // Nullable
  },
  category: {
    type: String,
    default: null, // Nullable
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
