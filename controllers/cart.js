const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy');
const { ObjectId } = require('mongodb');
const Cart = require('../models/Cart');


// TODO: Jest test
const getAllCarts = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    const carts = await database.collection('carts').find().toArray();
    res.json(carts);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// TODO: Jest test
const getCartById = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
    const database = await mongodb.getDb();
    const cart = await database.collection('carts').findOne({ _id: new ObjectId(id) });

    if ((req.session.user.role === 'manager' || req.session.user.role === 'customer') && cart.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }


    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

const getCartsByStoreId = async (req, res) => {
  const { store_id } = req.params;

  try {
    const database = await mongodb.getDb();
    const carts = await database.collection('carts').find({ store_id }).toArray();

    if (carts.length === 0) {
      return res.status(404).json({ message: 'No carts found the specified store' });
    }

    res.json(carts);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// Create a new cart
const createCart = async (req, res) => {
  const { cartData } = req.body;

  try {
    const database = await mongodb.getDb();

    // Calculate the total price based in the cart items
    let total_price = 0;
    cartData.items.forEach(item => {
      total_price += item.price * item.quantity;
    });

    let user_id = ''
    let store_id = ''

    if (req.session.user.role === 'manager' || req.session.user.role === 'admin') {
      user_id = cartData.user_id;
      if(req.session.user.role === 'admin'){
        store_id = cartData.store_id;
      }
    } else {
      user_id = req.session.user._id;
      store_id = req.session.user.store_id;
    }


    const newCart = {
      user_id,
      store_id,
      total_price,
      items: cartData.items
    };

    const cart = new Cart(newCart);
    await cart.validate();

    const result = await database.collection('carts').insertOne(newCart);
    res.status(201).json({ message: 'Cart created successfully', cartId: result.insertedId });

  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// Update cart
const updateCart = async (req, res) => {
  const { id } = req.params;

  // Validate the format Mongodb ID 
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
    const database = await mongodb.getDb();

    const cart = await database.collection('carts').findOne({ _id: new ObjectId(id) });

    if ((req.session.user.role === 'manager' || req.session.user.role === 'customer') && cart.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if(req.session.user.role === 'customer' && cart.user_id.toString() !== req.session.user._id){
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('carts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: req.body },
      { returnOriginal: false }
    );
 
    if (!response.value) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(response.value);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};


// Delete cart
const deleteCart = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {

    const cart = await database.collection('carts').findOne({ _id: new ObjectId(id) });
    if ((req.session.user.role === 'manager' || req.session.user.role === 'customer') && cart.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if(req.session.user.role === 'customer' && cart.user_id.toString() !== req.session.user._id){
      return res.status(403).json({ message: 'Forbidden' });
    }

    const database = await mongodb.getDb();
    const result = await database.collection('carts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(204).send();
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  getCartsByStoreId,
  createCart,
  updateCart,
  deleteCart
};
