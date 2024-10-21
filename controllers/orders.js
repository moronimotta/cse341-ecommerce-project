const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy.js');
const ObjectId = require('mongodb').ObjectId;
const Order = require('../models/Orders');

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

const getSingleOrder = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json('Must be a valid Order ID to find a order');
    }
    try { 
      const orderId = new ObjectId(req.params.id);
      const database = await mongodb.getDb();
      const response = await database.collection('orders').findOne({ _id: orderId });
  
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
    const orderData = {
      user_id: req.body.user_id,
      cart_id: req.body.cart_id,
      amount: req.body.amount,
      status: req.body.status,
      date: req.body.date,
    };
  
    try {
      const newOrder = new Order(orderData);
      await newOrder.validate();
  
      // Using mongodb native methods as it's easier for me, but validating with mongoose.
      const database = await mongodb.getDb();
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
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json('Must be a valid Order ID to update an order');
    }

    const orderData = {
      user_id: req.body.user_id,
      cart_id: req.body.cart_id,
      amount: req.body.amount,
      status: req.body.status,
      date: req.body.date,
    };
  
    try {
  
      const orderId = new ObjectId(req.params.id);
      const database = await mongodb.getDb();
      const response = await database.collection('orders').updateOne({ _id: orderId }, { $set: orderData });
  
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
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json('Must be a valid Order ID to delete an Order');
    }
    try {
      const orderId = new ObjectId(req.params.id);
      const database = await mongodb.getDb();
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
  
  module.exports = {getAllOrders, getSingleOrder, createOrder, updateOrder, deleteOrder}