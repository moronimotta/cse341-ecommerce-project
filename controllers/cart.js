const Cart = require('../models/Cart');

// Get all carts
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a cart for ID
const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new cart
const createCart = async (req, res) => {
  const { userId, items, totalPrice } = req.body;
  const cart = new Cart({ userId, items, totalPrice });

  try {
    const newCart = await cart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update cart
const updateCart = async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCart) return res.status(404).json({ message: 'Cart not found' });
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete cart
const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json({ message: 'Cart deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get total price for the cart
const getCartTotal = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id);
        if (!cart) return res.status(404).json({ message: 'Cart not found'});

        // Calculate the total plus the price total for all products multiplying by the quantty
        const total = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.json({ total });
    } catch (err) {
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
