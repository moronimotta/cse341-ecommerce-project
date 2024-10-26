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


// Customer can see his cart.
router.get('/:id', cartController.getCartById);

// TODO: get all carts according to user store_id
router.get('/store/:store_id', cartController.getCartsByStoreId);

module.exports = router;
