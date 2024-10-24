const mongodb = require('../data/database');
const dotenv = require('dotenv');
const sendNotification = require('../tools/ntfy');
const User = require('../models/User');
const storeController = require('./stores');


dotenv.config();
const ObjectId = require('mongodb').ObjectId;



const getUser = async (req, res, next) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
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
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {

    const users = await collection.find().toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateUser = async (req, res, next) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {
    const id = req.params.id;
    const user = req.body;

    if(user.store_id) {
      const input = { params: { id: user.store_id, validation: true } };

      const store = await storeController.getStore(input, res, next);
      if (!store) {
        return res.status(400).json({ message: 'Store not found' });  
      }
    }

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
  const database = await mongodb.getDb();
  const collection = await database.collection('users');
  let user = req.body;
  
  try {
    if (!user.github_id) {
      if (user.store_id) {
        const input = { params: { id: user.store_id, validation: true } };

        const store = await storeController.getStore(input, res, next);
        if (!store) {
          return;  
        }
      }

      const newUser = new User(user);
      await newUser.validate();
    }

    if (!user.role) {
      user.role = 'customer';
    }

    user.active = true;

    const response = await collection.insertOne(user);
    const output = response.insertedId.toString();

    if (response.acknowledged) {
      if (user.github_id) {
        return output;  
      }
      return res.status(201).json({ message: 'User created successfully' });
    } else {
      throw new Error('An error occurred while creating the order');
    }

  } catch (err) {
    sendNotification(err, 'system_error');
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
};




const deleteUser = async (req, res, next) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
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


const getUserByGithubId = async (id) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {

    const user = await collection.findOne({ github_id: id });

    if (!user) {
      return null;
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

// TODO: Get user by api key

module.exports = {
  getUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
  getUserByGithubId
};