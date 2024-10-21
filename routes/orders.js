const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');

// Admins
router.get('/', ordersController.getAllOrders);

// Only admins and managers (managers only change their store orders)
router.post('/', ordersController.createOrder);
router.put('/:id', ordersController.updateOrder);
router.delete('/:id', ordersController.deleteOrder);

// Customer can see his orders
router.get('/:id', ordersController.getSingleOrder);

// TODO: get all order by store_id


module.exports = router;
