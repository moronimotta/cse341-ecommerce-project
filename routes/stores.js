const express = require('express');
const router = express.Router();
const storesController = require('../controllers/stores');
const authorizationChecker = require('../tools/authorization-checker');


router.get('/', storesController.getStores);

router.post('/', authorizationChecker('manager'), storesController.createStore);
router.put('/:id', authorizationChecker('manager'), storesController.updateStore);
router.delete('/:id', authorizationChecker('manager'), storesController.deleteStore);

router.get('/:id', authorizationChecker('customer'), storesController.getStore);

module.exports = router;
