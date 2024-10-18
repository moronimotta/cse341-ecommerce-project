const router = require('express').Router();
const prodController = require('../controllers/products');


router.get('/', prodController.getAllProd);
//Get ony document.
router.get('/:id', prodController.getSingleProd);
//create
router.post('/', prodController.createProd);
//DELETE USER
router.delete('/:id', prodController.deleteProd);
//UPDATE USER
router.put('/:id', prodController.updateProd);

router.get('/get/low-stock', prodController.getLowStock);

module.exports = router;

 