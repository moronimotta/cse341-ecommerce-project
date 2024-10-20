const mongodb = require('../data/database');
const dotenv = require('dotenv');
const createError = require('http-errors');
const apiKeyGen = require('../tools/api-key-gen');
const sendNotification = require('../tools/ntfy');
const User = require('../models/User'); 


dotenv.config();

const userCollection = 'users';
const ObjectId = require('mongodb').ObjectId;

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

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
    const users = await User.find();
    
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

    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });

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
  try {
    let user = req.body;

    if (!user.role) {
      user.role = 'customer';
    }

    user.api_key = apiKeyGen();
    user.active = true;

    const newUser = await User.create(user); 

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newUser); 
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};



const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedUser = await User.findByIdAndDelete(id);

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