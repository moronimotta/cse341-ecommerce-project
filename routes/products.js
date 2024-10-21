const router = require('express').Router();
const prodController = require('../controllers/products');

// Only admins
router.get('/', prodController.getAllProd);
router.get('/:id', prodController.getSingleProd);

// Only admins and managers (managers only change their store products)
router.post('/', prodController.createProd);
router.delete('/:id', prodController.deleteProd);
router.put('/:id', prodController.updateProd);

// TODO: get all products according to user store_id. In Ntfy, make it send separetly to each store_topic
router.get('/get/low-stock', prodController.getLowStock);

// TODO: get all products according to user store_id 
module.exports = router;

 