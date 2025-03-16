const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user
router.get('/me', authenticate, getMe);

module.exports = router;