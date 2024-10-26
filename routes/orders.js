const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const authorizationChecker = require('../tools/authorization-checker');


// Admins
router.get('/',authorizationChecker('admin'), ordersController.getAllOrders);

// Only admins and managers (managers only change their store orders)
router.post('/', ordersController.createOrder);
router.put('/:order_id', authorizationChecker('manager'), ordersController.updateOrder);
router.delete('/:order_id', authorizationChecker('manager'), ordersController.deleteOrder);
router.put('/refund/:id', authorizationChecker('manager'), ordersController.refundOrder)
router.put('/pay/:id', authorizationChecker('manager'), ordersController.payOrder)

// Customer can see his orders.
router.get('/:order_id', authorizationChecker('customer'), ordersController.getSingleOrder);
router.get('/store/:id', authorizationChecker('customer'), ordersController.getAllOrdersByStoreId);
router.get('/user/:id', authorizationChecker('customer'), ordersController.getAllOrdersByUserId);


module.exports = router;
