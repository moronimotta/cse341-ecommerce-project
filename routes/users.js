const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { usersRule, validate } = require('../tools/validation')

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.post('/', validate(usersRule()), usersController.createUser);
router.put('/:id', validate(usersRule()), usersController.updateUser);
router.delete('/:id', usersController.deleteUser);



module.exports = router;
