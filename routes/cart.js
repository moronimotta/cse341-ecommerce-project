const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const sendNotification = require('../tools/ntfy')

// Admins
router.get('/', cartController.getAllCarts);

// Only admins and managers (managers only change their store Carts)
router.post('/', cartController.createCart);
router.put('/:id', cartController.updateCart);
router.delete('/:id', cartController.deleteCart);


// I dont think we need that.
router.get('/:id/total', cartController.getCartTotal);

// Customer can see his cart.
router.get('/:id', cartController.getCartById);

// TODO: get all carts according to user store_id

module.exports = router;
