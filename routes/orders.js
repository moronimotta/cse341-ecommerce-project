const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const { ordersRule, validate } = require('../tools/validation')


router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getSingleOrder);
router.post('/', validate(ordersRule()) ,ordersController.createOrder);
router.put('/:id', validate(ordersRule()), ordersController.updateOrder);
router.delete('/:id', ordersController.deleteOrder);



module.exports = router;
