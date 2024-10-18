const express = require('express');
const Cart = require('../models/Cart');
const router = express.Router();

// Get all the carts
router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find();
        res.json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 


// Get a cart for ID 
router.get('/:id', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Create a new cart
router.post ('/', async (req, res) => {
    const { userId, items, totalPrice } = req.body;
    const cart = new Cart({ userId, items, totalPrice });

    try {
        const newCart = await cart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Update a cart 
router.put('/:id', async (req, res) => {
    try {
        const updateCart = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updateCart) return res.status(404).json({ message: 'Cart not found' });
        res.json(updateCart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete a cart
router.delete('/id', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json({ message: 'Cart deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;