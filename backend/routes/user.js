const express = require ('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const passwordValidator = require('../middleware/passwordValidator');
const emailValidator = require('../middleware/emailValidator');

router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', emailValidator, userCtrl.login);

module.exports = router;