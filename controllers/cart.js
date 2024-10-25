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

const getCartsByStoreId = async (req, res) => {
  const { store_id } = req.params;

  try {
    const database = await mongodb.getDb();
    const carts = await database.collection('carts').find({ store_id }).toArray();

    if (carts.length === 0) {
      return res.status(404).json({ message: 'No carts found the specified store' });
    }

    res.json(carts);
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
  }
};

// Create a new cart
const createCart = async (req, res) => {
  const { cartData } = req.body;

  try {
    const database = await mongodb.getDb();

    // Calculate the total price based in the cart items
    let total_price = 0;
    cartData.items.forEach(item => {
      total_price += item.price * item.quantity;
    });

    // setting user_id and store_id using the session values
    const user_id = req.session.user._id;
    const store_id = req.session.user.store_id;

    // create the cart object with the properties name updated
    const newCart = {
      user_id,
      store_id,
      total_price,
      items: cartData.items
    };

    const result = await database.collection('carts').insertOne(newCart);
    res.status(201).json({ message: 'Cart created successfully', cartId: result.insertedId });
  
  } catch (err) {
    sendNotification(err, 'system_error');
    res.status(500).json({ message: err.message });
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
  getCartsByStoreId,
  createCart,
  updateCart,
  deleteCart,
  getCartTotal
};
