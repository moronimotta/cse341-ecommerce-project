const router = require('express').Router();

router.use('/swagger', require('./swagger')); 
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/cart', require('./cart'));

router.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;
