const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const authorizationChecker = require('../tools/authorization-checker');

router.post('/',  authorizationChecker('customer'), cartController.createCart);
router.put('/:cart_id',  authorizationChecker('customer'), cartController.updateCart);
router.delete('/:cart_id',  authorizationChecker('customer'), cartController.deleteCart);

router.get('/', authorizationChecker('admin'), cartController.getAllCarts);
router.get('/:cart_id', authorizationChecker('customer'), cartController.getCartById);
router.get('/store/:store_id', authorizationChecker('manager'), cartController.getCartsByStoreId);

module.exports = router;
