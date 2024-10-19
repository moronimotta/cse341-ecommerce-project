const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    match: /.+\@.+\..+/
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    required: true,
  },
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
