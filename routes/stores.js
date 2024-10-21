const express = require('express');
const router = express.Router();
const storesController = require('../controllers/stores');

router.get('/', storesController.getStores);
router.get('/:id', storesController.getStore);

// Authorization, only admins can create, update and delete stores
router.post('/', storesController.createStore);
router.put('/:id', storesController.updateStore);
router.delete('/:id', storesController.deleteStore);


module.exports = router;
