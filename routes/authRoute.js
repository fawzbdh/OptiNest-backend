const express = require('express');
const {
loginValidator,signupValidator
} = require('../utils/validators/authValidator');

const {
  signup,
  login,
 
  
} = require('../controllers/authController');

const router = express.Router();
router.post('/signup',signupValidator,signup);
router.post('/login', loginValidator, login);
// router.post('/forgotPassword', forgotPassword);
// router.post('/verifyResetCode', verifyPassResetCode);
// router.put('/resetPassword', resetPassword);

module.exports = router;