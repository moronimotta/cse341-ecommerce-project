const router = require('express').Router();
const sendNotification = require('../tools/ntfy');

router.use('/swagger', require('./swagger')); 
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

router.get('/', (req, res) => {
  res.send('Welcome to the CSE 341 Final Project API');
});

router.get('/healthcheck', (req, res) => {
  res.send('OK');
});

module.exports = router;
