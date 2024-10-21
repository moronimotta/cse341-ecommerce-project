const mongodb = require('../data/database');
const dotenv = require('dotenv');
const sendNotification = require('../tools/ntfy');
const User = require('../models/User');


dotenv.config();
const ObjectId = require('mongodb').ObjectId;

const database = await mongodb.getDb();
const collection = await database.collection('users')

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getUsers = async (req, res, next) => {
  try {
   
    const users = await collection.find().toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.body;
  
    const updatedUser = collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: user });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createUser = async (req, res, next) => {
  let user = req.body;
  try {

    const newUser = new User(user);
    await newUser.validate();

    if (!user.role) {
      user.role = 'customer';
    }

    user.active = true;

    const database = await mongodb.getDb();
    const response = await database.collection('users').insertOne(orderData);

    if (response.acknowledged) {
      res.status(201).json({ message: 'User created successfully' });
    } else {
      throw new Error('An error occurred while creating the order');
    }

  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};



const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedUser = collection.findOneAndDelete({ _id: new ObjectId(id) });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// TODO: Get user by api key

module.exports = {
  getUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
};