const router = require('express').Router();
const prodController = require('../controllers/products');
const authorizationChecker = require('../tools/authorization-checker');

router.get('/', authorizationChecker('admin'), prodController.getAllProd);

router.post('/', authorizationChecker('manager'), prodController.createProd);
router.delete('/:id', authorizationChecker('manager'), prodController.deleteProd);
router.put('/:id', authorizationChecker('manager'), prodController.updateProd);

router.get('/:id', authorizationChecker('customer'), prodController.getSingleProd);
router.get('/store/:id', authorizationChecker('customer'), prodController.getAllProductsByStoreId);

router.get('/get/low-stock', prodController.getLowStock);

module.exports = router;

 