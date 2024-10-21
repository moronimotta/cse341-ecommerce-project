const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// Admins
router.get('/', usersController.getUsers);

// Customer can see his account and modify.
// admins sees all and changes all
// managers  only change their store users
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

// TODO: get all users by store_id

module.exports = router;
