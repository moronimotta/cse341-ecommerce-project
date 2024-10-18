const mongodb = require('../data/database');
const dotenv = require('dotenv');
const createError = require('http-errors');
const apiKeyGen = require('../tools/api-key-gen');
const sendNotification = require('../tools/ntfy');

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
    // swagger-tags=['Users']
    let db = mongodb.getDb();
    const id = req.params.id;
    const user = req.body;
    const result = await db.collection(userCollection).find({ _id: new ObjectId(id) });
    const users = await result.toArray();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.collection(userCollection).updateOne({ _id: new ObjectId(id) }, { $set: user });

    res.setHeader('Content-Type', 'application/json');
    return res.status(204).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res, next) => {
//  TODO: add company name to user
  try {
    // swagger-tags=['Users']
    let db = mongodb.getDb();
    let user = req.body;

    if (!user.role) {
      user.role = 'customer';
    }

    user.api_key = apiKeyGen();
    user.active = true;
    if (process.env.TEST_ERROR) {
      throw new Error('Testing error');
    }

    await db.collection(userCollection).insertOne(user);
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
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