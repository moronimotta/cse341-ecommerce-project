const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const authorizationChecker = require('../tools/authorization-checker');


// Admins
router.get('/',authorizationChecker('admin'), ordersController.getAllOrders);

router.post('/', authorizationChecker('customer'), ordersController.createOrder);
router.put('/:order_id', authorizationChecker('manager'), ordersController.updateOrder);
router.delete('/:order_id', authorizationChecker('manager'), ordersController.deleteOrder);
router.get('/store/:id', authorizationChecker('manager'), ordersController.getAllOrdersByStoreId);

// Customer can see his orders.
router.put('/refund/:id', authorizationChecker('customer'), ordersController.refundOrder)
router.put('/pay/:id', authorizationChecker('customer'), ordersController.payOrder)
router.get('/:order_id', authorizationChecker('customer'), ordersController.getSingleOrder);
router.get('/user/:id', authorizationChecker('customer'), ordersController.getAllOrdersByUserId);


module.exports = router;
