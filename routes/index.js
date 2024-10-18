const router = require('express').Router();

router.use('/swagger', require('./swagger')); 
router.use('/users', require('./users'));
router.use('/products', require('./products'));

router.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;
