const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy');
const ObjectId = require ('mongodb').ObjectId;
const Product = require('../models/Products');
const storeController = require('./stores');

// TODO: Jest test
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

// TODO: Jest test
const getSingleProd = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    const response = await database.collection('products').findOne({ _id: new ObjectId(req.params.product_id) });

    if ((req.session.user.role === 'manager'  || req.session.user.role === 'customer')  && response.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' }); 
    }

    if (response) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(response); 
    } else {
      return res.status(404).json({ message: 'Product not found' }); 
    }
  } catch (error) {
    sendNotification(error, 'system_error');
    return res.status(400).json({ message: error.message || 'An unknown error occurred' }); 
  }
};


//Create a new product
const createProd = async (req,res)=>{
    const product = req.body;
    const database = await mongodb.getDb()
    const collection = await database.collection('products')
  
    try {
      
      if(req.session.user.role !== 'admin' && product.store_id !== undefined){
        product.store_id = req.session.user.store_id;
      }else if (product.store_id === undefined){
        product.store_id = req.session.user.store_id;
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
  if (!ObjectId.isValid(req.params.product_id)) {
    return res.status(400).json('Must be a valid Product ID to update a product');
  }

  const productId = new ObjectId(req.params.product_id);
  const database = await mongodb.getDb();
  const collection = await database.collection('products');

  try {
    const productToUpdate = await collection.findOne({ _id: new ObjectId(req.params.product_id) });
    
    if (req.session.user.role === 'manager' && productToUpdate.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await collection.updateOne({ _id: productId }, { $set: req.body });

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
  if (!ObjectId.isValid(req.params.product_id)) {
    return res.status(400).json('Must be a valid Product ID to delete a Product');
  }

  try {
    const prodId = new ObjectId(req.params.product_id);
    const database = await mongodb.getDb();
    const collection = await database.collection('products');
    
    const productToDelete = await collection.findOne({ _id: prodId });
    if (req.session.user.role === 'manager' && productToDelete.store_id.toString() !== req.session.user.store_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
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

// TODO: Jest test
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

const updateStock = async (prod_id, quantity, type = 'pay') => {
  const db = mongodb.getDb();
  const product = await db.collection('products').findOne({ _id: new ObjectId(prod_id) });
  let newStock;

  if (type === 'pay') {
    newStock = product.stock - quantity;
  } else {
    newStock = product.stock + quantity;
  }

  await db.collection('products').updateOne({ _id: new ObjectId(prod_id) }, { $set: { stock: newStock } });
};

// TODO: Jest test
const getLowStock = async (req, res, next) => {
  try {

    const id = req.params.id;

    const db = mongodb.getDb();
  
    const result = await db.collection('products').find({
      store_id: new ObjectId(id),
      stock: { $lt: 20 }
    }).toArray();
    
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
    getLowStock,
    updateStock
  }