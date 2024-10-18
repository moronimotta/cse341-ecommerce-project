const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

// Cart routes
router.get('/', cartController.getAllCarts);
router.get('/:id', cartController.getCartById);
router.post('/', cartController.createCart);
router.put('/:id', cartController.updateCart);
router.delete('/:id', cartController.deleteCart);
router.get('/:id/total', cartController.getCartTotal);

module.exports = router;
