const Cart = require('../models/Cart'); // Asumimos que este es tu modelo Mongoose, pero lo usaremos solo para la validación
const mongodb = require('../data/database.js');
const sendNotification = require('../tools/ntfy');
const { MongoClient, ObjectId } = require('mongodb');


// Get all carts
const getAllCarts = async (req, res) => {
  try {
    const database = await mongodb.getDb();
    const carts = await database.collection('carts').find().toArray();
    res.json(carts);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// Get a cart by ID
const getCartById = async (req, res) => {
  const { id } = req.params;

  // Log para verificar el ID recibido
  console.log(`ID recibido: ${id}`);

  // Validar el formato del ObjectId
  if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
      const database = await mongodb.getDb(); // Asegúrate de que esta función se esté exportando correctamente
      const cart = await database.collection('carts').findOne({ _id: new ObjectId(id) }); // Usa new ObjectId

      // Verificar si el carrito existe
      if (!cart) {
          console.log('Carrito no encontrado con ese ID');
          return res.status(404).json({ message: 'Cart not found' });
      }

      // Enviar el carrito encontrado
      res.json(cart);
  } catch (err) {
      console.error('Error al buscar el carrito:', err);
      res.status(500).json({ message: err.message });
  }
};

// Create a new cart
const createCart = async (req, res) => {
  const { userId, items, totalPrice } = req.body;

  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid cart data' });
  }

  const cartData = {
    userId,
    items,
    totalPrice: totalPrice || 0, 
  };

  try {
    const cart = new Cart(cartData);
    await cart.validate(); // Esto puede ser opcional dependiendo de cómo quieras manejar la validación

    const database = await mongodb.getDb(); 
    const response = await database.collection('carts').insertOne(cartData);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Cart created successfully', cartId: response.insertedId });
    } else {
      throw new Error('An error occurred while creating the cart');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
  }
};

// Update cart
const updateCart = async (req, res) => {
  const { id } = req.params;

  // Validate the format Mongodb ID 
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
    const database = await mongodb.getDb(); 
    const response = await database.collection('carts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: req.body },
      { returnOriginal: false } 
    );

    if (!response.value) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(response.value);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};


// Delete cart
const deleteCart = async (req, res) => {
  const { id } = req.params;

  // Log para verificar el ID recibido
  console.log(`ID recibido para eliminar: ${id}`);

  // Validar el formato del ObjectId
  if (!ObjectId.isValid(id)) { // Asegúrate de usar ObjectId aquí
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
    const database = await mongodb.getDb();
    const result = await database.collection('carts').deleteOne({ _id: new ObjectId(id) });

    // Verificar si se eliminó algún carrito
    if (result.deletedCount === 0) {
      console.log('Carrito no encontrado con ese ID');
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(204).send(); // Enviar respuesta de éxito
  } catch (err) {
    console.error('Error al eliminar el carrito:', err);
    res.status(500).json({ message: err.message });
  }
};


// Get total price for the cart
const getCartTotal = async (req, res) => {
  const { id } = req.params;

  // Verifica si mongodb.ObjectId está definido
  if (!mongodb.ObjectId) {
    return res.status(500).json({ message: 'Database object is not defined' });
  }

  if (!mongodb.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid cart ID format' });
  }

  try {
    const database = await mongodb.getDb();
    const cart = await database.collection('carts').findOne({ _id: mongodb.ObjectId(id) });
    
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Calcula el total de los productos
    const total = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    res.json({ total });
  } catch (err) {
    console.error('Error fetching cart total:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  getCartTotal
};
