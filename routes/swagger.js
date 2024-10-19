const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const dotenv = require('dotenv');
dotenv.config();

if(process.env.ENV !== 'production') {
    const swaggerDocument = require('../swagger-dev.json');
}else{

    const swaggerDocument = require('../swagger-prod.json');
}

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

module.exports = router;