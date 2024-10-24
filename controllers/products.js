const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy');
const ObjectId = require ('mongodb').ObjectId;
const Product = require('../models/Products');
const storeController = require('./stores');

//Get all products
const getAllProd = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    const response = await database.collection('products').find().toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ message: error.message || 'An error occurred while fetching the products.' });
  }
};

//Get a single product
const getSingleProd = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json('Must be a valid Order ID to find a product');
  }
  try { 
    const productId = new ObjectId(req.params.id);
    const database = await mongodb.getDb();
    const response = await database.collection('products').findOne({ _id: productId });

    if (response) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(400).json({ message: error.message || 'An unknown error occurred' });
  }
};

//Create a new product
const createProd = async (req,res)=>{
    const product = req.body;
    const database = await mongodb.getDb()
    const collection = await database.collection('products')
  
    try {
      if (product.store_id) {
        const store = await storeController.getStore(product.store_id);
        if (!store) {
          return res.status(400).json({ message: 'Store not found' });
        }
      }
      const newProduct = new Product(product);
      await newProduct.validate();

      const response = await collection.insertOne(newProduct);

      if (response.acknowledged) {
        res.status(201).json({ message: 'Product created successfully' });
      } else {
        throw new Error('An error occurred while creating the product');
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

//Update a product
const updateProd = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json('Must be a valid Product ID to update a product');
  }

  const productId = new ObjectId(req.params.id);
  const database = await mongodb.getDb();
  const collection = await database.collection('products');

  try {
    const productUpdates = { ...req.body };

    const updatedProduct = new Product(productUpdates);
    await updatedProduct.validate();

    delete productUpdates._id; //This prevents the 'inmutable _id' error from mongodb

    const response = await collection.updateOne({ _id: productId },{ $set: productUpdates });

    if (response.modifiedCount > 0) {
      res.status(204).send(); 
    } else if (response.matchedCount === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      throw new Error('Product update was not successful');
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

//Delete a product
const deleteProd = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json('Must be a valid Product ID to delete a Product');
  }

  try {
    const prodId = new ObjectId(req.params.id);
    const database = await mongodb.getDb();
    const response = await database.collection('products').deleteOne({ _id: prodId });

    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Product not found' }); 
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ error: error.message || 'An unknown error occurred' }); 
  }
};

//Get all products by store_id
const getAllProductsByStoreId = async (req, res) => {
  const store_id = req.params;

  try {
    const database = await mongodb.getDb();
    const response = await database.collection('products').find({ store_id: new ObjectId(store_id) }).toArray();

    if (response.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'No products found for this store' });
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    res.status(500).json({ message: error.message || 'An error occurred while fetching products.' });
  }
};

//Get low stock
const getLowStock = async (req, res, next) => {
  try {
    const db = mongodb.getDb();
    console.log(db);  
  
    // TODO: get user by api key, then check if is manager or admin. If it is, then return all products with low stock and user_id
    const result = await db.collection('products').find({ stock: { $lt: 20 } }).toArray();
    console.log(result);  

    if (result.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(result); 
    } else {
      res.status(404).json({ message: 'No products with low stock found' });
    }
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};
  
  

  module.exports = {
    getAllProd,
    getSingleProd,
    updateProd,
    createProd,
    deleteProd,
    getAllProductsByStoreId,
    getLowStock
  }