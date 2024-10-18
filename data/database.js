const { MongoClient } = require('mongodb');
const createError = require('http-errors');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
let _db;

const initDb = (callback) => {
  if (_db) {
    return callback(null, _db);
  }

  MongoClient.connect(uri)
    .then((client) => {
      _db = client.db(dbName);
      callback(null, _db);
    })
    .catch((err) => {
      callback(createError(500, 'Failed to connect to the database', { cause: err }));
    });
};

const getDb = () => {
  if (!_db) {
    throw createError(500, 'DB not initialized');
  }
  return _db;
};

module.exports = {
  initDb,
  getDb,
};