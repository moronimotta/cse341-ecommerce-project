const router = require('express').Router();

router.use('/swagger', require('./swagger')); 
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/cart', require('./cart'));
router.use('/orders', require('./orders'));
router.use('/store', require('./stores'));

router.get('/', (req, res) => {
  res.send('Welcome to the CSE 341 Final Project API');
});

router.get('/healthcheck', (req, res) => {
  res.send('OK');
});


// TODO: Login and Logout routes using passport.js


module.exports = router;
