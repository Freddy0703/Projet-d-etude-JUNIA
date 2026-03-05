const express = require('express');
const router = express.Router();
const { login, logout, me, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;