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

  try {
    const database = await mongodb.getDb();
    const cart = await database.collection('carts').findOne({ _id: new ObjectId(req.params.cart_id) });
    if (cart === undefined) {
      return res.status(404).json({ message: 'Cart not found' });
    }
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
  try {
    const database = await mongodb.getDb();
    const carts = await database.collection('carts').find({ store_id: req.params.store_id }).toArray();

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
  
  try {
    const database = await mongodb.getDb();

    // Calculate the total price based in the cart items
    let total_price = 0;
    req.body.items.forEach(item => {
      if(!item.price || !item.quantity){
        throw new Error('Invalid item format');
      }
      total_price += item.price * item.quantity;
    });

    let user_id = ''
    let store_id = ''

    if (req.session.user.role === 'manager' || req.session.user.role === 'admin') {
      user_id = req.body.user_id;
      if(req.session.user.role === 'admin'){
        store_id = req.body.store_id;
      }
    } else {
      user_id = req.session.user._id;
      store_id = req.session.user.store_id;
    }


    const newCart = {
      user_id,
      store_id,
      total_price,
      items: req.body.items
    };

    const cart = new Cart(newCart);
    await cart.validate();

    const result = await database.collection('carts').insertOne(newCart);
    res.status(201).json({ message: 'Cart created successfully', _id: result.insertedId });

  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// Update cart
const updateCart = async (req, res) => {

  try {
    const database = await mongodb.getDb();

    const cart = await database.collection('carts').findOne({ _id: new ObjectId(req.params.cart_id) });

    if ((req.session.user.role === 'manager' || req.session.user.role === 'customer') && cart.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if(req.session.user.role === 'customer' && cart.user_id.toString() !== req.session.user._id){
      return res.status(403).json({ message: 'Forbidden' });
    }

    if(req.body.total_price !== undefined){
      throw new Error('Total price cannot be updated');
    }
    
    // if items are updated, then recalculate the total price
    if (req.body.items) {
      let total_price = 0;
      req.body.items.forEach(item => {
        if(!item.price || !item.quantity){
          throw new Error('Invalid item format');
        }
        total_price += item.price * item.quantity;
      });
      req.body.total_price = total_price;
    }

    const response = await database.collection('carts').findOneAndUpdate(
      { _id: new ObjectId(req.params.cart_id) },
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

  try {

    const cart = await database.collection('carts').findOne({ _id: new ObjectId(req.params.cart_id) });
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
