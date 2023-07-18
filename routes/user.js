const express = require('express');
const { submitForm, showRejPage, signIn,showLogPage, resetPassword, showResetPage, verifyUser, reVerifyUser } = require('../controllers/user');
const router = express.Router();

// Registration page routes
router.get('/', showRejPage);
router.post('/', submitForm);
// Login page routes
router.get('/login', showLogPage);
router.post('/login',signIn);
// Reset Password page routes
router.get('/forgetPassword',showResetPage);
router.post('/forgetPassword',resetPassword);
// Reset Password page routes from mail
router.get('/forgetPassword/:id/:token',verifyUser);
router.post('/forgetPassword/:id/:token',reVerifyUser);

// exporting routes 
module.exports = router;

