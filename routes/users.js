const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const authorizationChecker = require('../tools/authorization-checker');

router.get('/', authorizationChecker('admin'), usersController.getUsers);
router.get('/:id', authorizationChecker('customer'), usersController.getUser);
router.post('/', usersController.createUser);

router.put('/:id', authorizationChecker('customer'), usersController.updateUser);
router.delete('/:id', authorizationChecker('customer'), usersController.deleteUser);

router.get('/store/:id', authorizationChecker('manager'), usersController.getUsersByStoreId);

module.exports = router;
