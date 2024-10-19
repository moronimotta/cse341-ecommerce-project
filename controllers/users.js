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

    // swagger-tags=['Users']
    let db = mongodb.getDb();
    const id = req.params.id;
    const result = await db.collection(userCollection).find({ _id: new ObjectId(id) });
    const users = await result.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users[0]);
  } catch (err) {
    throw res.json(createError(500, err.message));
  }
};

const getUsers = async (req, res, next) => {
  try {
    // swagger-tags=['Users']
    let db = mongodb.getDb();
    const result = await db.collection(userCollection).find();
    const users = await result.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (err) {
    throw res.json(createError(500, err.message));
}
};

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const userUpdates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
      new: true, 
      runValidators: true, 
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(updatedUser); 
  } catch (err) {
    sendNotification(err, 'system_error');
    return res.status(500).json({ message: err.message });
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

    // Create a new user instance
    const newUser = await User.create(user); // Use User.create directly

    sendNotification("User " + newUser.name + " successfully created", 'info');

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newUser); // Send the created user back
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};



const deleteUser = async (req, res, next) => {
  try {
    // swagger-tags=['Users']
    let db = mongodb.getDb();
    const id = req.params.id;
    await db.collection(userCollection).deleteOne({ _id: new ObjectId(id) });

    res.setHeader('Content-Type', 'application/json');
    res.status(204).send();
  } catch (err) {
    sendNotification(err, 'system_error');
    throw res.json(createError(500, err.message));
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