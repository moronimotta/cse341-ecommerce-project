const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy.js');
const ObjectId = require('mongodb').ObjectId;
const Order = require('../models/Orders');
const productController = require('./products');  
// TODO: Jest test
const getAllOrders = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    const response = await database.collection('orders').find().toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ message: error.message || 'An error occurred while fetching the order.' });
  }
};
// TODO: Jest test
const getSingleOrder = async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.order_id);
    const database = await mongodb.getDb();
    const response = await database.collection('orders').findOne({ _id: orderId });

    if (req.session.user.role === 'manager' && response.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'customer' && response.user_id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (response) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(400).json({ message: error.message || 'An unknown error occurred' });
  }
};

const createOrder = async (req, res) => {
  const orderData = { ...req.body, status: 'pending' };

  try {
    const database = await mongodb.getDb();

    // Check if store_id exists
    if (orderData.store_id) {
      const store = await database.collection('stores').findOne({ _id: new ObjectId(orderData.store_id) });
      if (!store) {
        return res.status(400).json({ message: 'Store not found' });
      }
    }

    // Check if cart_id exists
    if (orderData.cart_id) {
      const cart = await database.collection('carts').findOne({ _id: new ObjectId(orderData.cart_id) });
      if (!cart) {
        return res.status(400).json({ message: 'Cart not found' });
      }
    }

    if (req.session.user.role === 'manager' && orderData.store_id.toString() !== req.session.user.store_id &&
      cart.store_id.toString() !== req.session.user.store_id && cart.user_id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.session.user.role === 'customer' && orderData.user_id.toString() !== req.session.user._id &&
      cart.user_id.toString() !== req.session.user._id && cart.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newOrder = new Order(orderData);
    await newOrder.validate();

    const response = await database.collection('orders').insertOne(orderData);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Order created successfully' });
    } else {
      throw new Error('An error occurred while creating the order');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      sendNotification(error, 'system_error');
      res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
  }
};

const updateOrder = async (req, res) => {

  try {

    const orderId = new ObjectId(req.params.order_id);
    const database = await mongodb.getDb();

    const order = await database.collection('orders').findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.session.user.role === 'manager' && order.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.session.user.role === 'customer' && order.user_id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('orders').updateOne({ _id: orderId }, { $set: req.body });

    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else if (response.matchedCount === 0) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      throw new Error('Order update was not successful');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      sendNotification(error, 'system_error');
      res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.order_id);
    const database = await mongodb.getDb();

    const order = await database.collection('orders').findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.session.user.role === 'manager' && order.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('orders').deleteOne({ _id: orderId });

    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ error: error.message || 'An unknown error occurred' });
  }
};
// TODO: Jest test
const getAllOrdersByStoreId = async (req, res) => {
  try {
    const database = await mongodb.getDb();

    if(req.params.id !== req.session.user.store_id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('orders').find({ store_id: req.params.id }).toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ message: error.message || 'An error occurred while fetching the order.' });
  }
};
// TODO: Jest test
const getAllOrdersByUserId = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    if(req.params.user_id !== req.session.user._id && req.session.user.role === 'customer') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const response = await database.collection('orders').find({ user_id: req.params.user_id }).toArray();

    if (response.length === 0) {
      return res.status(404).json({ message: 'No orders found for the specified user' });
    }

    if (req.session.user.role === 'manager' && response.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ message: error.message || 'An error occurred while fetching the order.' });
  }
}

const payOrder = async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.order_id);
    const database = await mongodb.getDb();

    const order = await database.collection('orders').findOne({ _id: orderId });

    if (req.session.user.role === 'manager' && order.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'customer' && order.user_id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('orders').updateOne({ _id: orderId }, { $set: { status: 'paid' } });

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Order status updated to paid' });
    } else if (response.matchedCount === 0) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      throw new Error('Order is already paid');
    }

    const cart = await database.collection('carts').findOne({ _id: order.cart_id });

    for (let item of cart.items) {
      await productController.updateStock(item.product_id, item.quantity, 'pay');
    }


  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ error: error.message || 'An unknown error occurred' });
  }
};

const refundOrder = async (req, res) => {
 
  try {
    const orderId = new ObjectId(req.params.order_id);
    const database = await mongodb.getDb();
    const order = await database.collection('orders').findOne({ _id: orderId });

    if (req.session.user.role === 'manager' && order.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'customer' && order.user_id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await database.collection('orders').updateOne({ _id: orderId }, { $set: { status: 'refund', amount: 0 } });

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Order status refunded' });
    } else {
      res.status(500).json({ message: 'Failed to update order status to refund' });
    }

    const cart = await database.collection('carts').findOne({ _id: order.cart_id });

    for (let item of cart.items) {
      await productController.updateStock(item.product_id, item.quantity, 'refund');
    }

  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ error: error.message || 'An unknown error occurred' });
  }
};

module.exports = { getAllOrders, getSingleOrder, createOrder, updateOrder, deleteOrder, getAllOrdersByStoreId, getAllOrdersByUserId, payOrder, refundOrder };