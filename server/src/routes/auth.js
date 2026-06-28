const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', protect, authorize('admin'), register);
router.get('/me', protect, getMe);

module.exports = router;