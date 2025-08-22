const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', userController.registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', userController.loginUser);

module.exports = router;