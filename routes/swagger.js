const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const dotenv = require('dotenv');
dotenv.config();
let swaggerDocument;

if(process.env.ENV !== 'production') {
    swaggerDocument = require('../swagger-dev.json');
}else{

    swaggerDocument = require('../swagger-prod.json');
}

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

module.exports = router;