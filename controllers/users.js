const mongodb = require('../data/database');
const dotenv = require('dotenv');
const sendNotification = require('../tools/ntfy');
const User = require('../models/User');
const storeController = require('./stores');
const { v4: uuidv4 } = require('uuid');



dotenv.config();
const ObjectId = require('mongodb').ObjectId;


// TODO: Jest test
const getUser = async (req, res, next) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {
    const id = req.params.id;

    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (req.session.user.role === 'manager' && user.store_id !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'customer' && user._id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TODO: Jest test
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

    if (user.store_id !== undefined) {
      const input = { params: { id: user.store_id, validation: true } };

      const store = await storeController.getStore(input, res, next);
      if (!store) {
        return res.status(400).json({ message: 'Store not found' });
      }
    }


    const userToUpdate = await collection.findOne({ _id: new ObjectId(id) });
    if (req.session.user.role === 'customer' && userToUpdate._id.toString() !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'manager' && userToUpdate.store_id !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
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
  if (req.session.user !== undefined && user.store_id !== undefined) {
    if (req.session.user.role !== 'admin') {
      if (req.session.user.store_id !== user.store_id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
  }

  try {

    if (user.github_id) {
      user.role = 'customer';
      user.active = true;
      user.api_key = uuidv4();
      const response = await collection.insertOne(user);
      const output = {
        id: response.insertedId.toString(),
        api_key: user.api_key
      };

      if (response.acknowledged) {
        if (user.github_id) {
          return output;
        }
        return res.status(201).json({ message: 'User created successfully' });
      } else {
        throw new Error('An error occurred while creating the order');
      }
    } else {
      if (req.session.user !== undefined) {
        if (req.session.user.role !== 'admin' && user.store_id !== undefined) {
          user.store_id = req.session.user.store_id;
        }
      } else {
        if (user.store_id === undefined) {
          throw new Error('Store id is required');
        }
      }

      if (user.role === undefined) {
        user.role = 'customer';
      }
      if (user.role === 'admin' && req.session.user.role !== 'admin') {
        user.role = 'customer';
      }
      if (user.role === 'manager' && (req.session.user.role !== 'manager' || req.session.user.role !== 'admin')) {
        user.role = 'customer';
      }


      if (req.session.user.role !== 'admin' && user.store_id !== undefined) {
        user.store_id = req.session.user.store_id;
      }
      if (user.store_id === undefined) {
        user.store_id = req.session.user.store_id;
      }



      user.active = true;
      user.api_key = uuidv4();

      const existingUser = await collection.findOne({ email: user.email, store_id: user.store_id });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists for this store' });
      }

      // create the user
      const response = await collection.insertOne(user);
      if (response.acknowledged) {
        return res.status(201).json({ message: 'User created successfully' });
      } else {
        throw new Error('An error occurred while creating the order');
      }

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

    const userToDelete = await collection.findOne({ _id: new ObjectId(id) });

    if (req.session.user.role === 'customer' && userToDelete._id !== req.session.user._id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.session.user.role === 'manager' && userToDelete.store_id !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const deletedUser = collection.findOneAndDelete({ _id: new ObjectId(id) });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(204).send();
  } catch (err) {
    sendNotification(err, 'system_error');
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
    sendNotification(err, 'system_error');
    throw new Error(err.message);
  }
};

const getUserByIdAndApiKey = async (id, apiKey) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {

    const user = await collection.findOne({ _id: new ObjectId(id), api_key: apiKey });

    if (!user) {
      return null;
    }
    return user;
  } catch (err) {
    sendNotification(err, 'system_error');
    throw new Error(err.message);
  }
};

const getUsersByStoreId = async (id) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {

    const users = await collection.find({ store_id: id }).toArray();

    if (!users) {
      return null;
    }
    return users;
  } catch (err) {
    sendNotification(err, 'system_error');
    throw new Error(err.message);
  }
};

const getUserByEmailAndPassword = async (email, password) => {
  const database = await mongodb.getDb();
  const collection = await database.collection('users')
  try {


    const user = await collection.findOne({ email: email, password: password });

    if (!user) {
      return null;
    }
    return user;
  }
  catch (err) {
    sendNotification(err, 'system_error');
    throw new Error(err.message);
  }
}

module.exports = {
  getUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
  getUserByGithubId,
  getUserByIdAndApiKey,
  getUsersByStoreId,
  getUserByEmailAndPassword
};