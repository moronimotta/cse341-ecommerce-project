const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const authorizationChecker = require('../tools/authorization-checker');


// Admins
router.get('/', ordersController.getAllOrders);

// Only admins and managers (managers only change their store orders)
router.post('/', ordersController.createOrder);
router.put('/:order_id', ordersController.updateOrder);
router.delete('/:order_id', ordersController.deleteOrder);

// Customer can see his orders.
router.get('/:order_id', ordersController.getSingleOrder);

router.get('/store/:id', ordersController.getAllOrdersByStoreId);
router.get('/user/:id', ordersController.getAllOrdersByUserId);


module.exports = router;
