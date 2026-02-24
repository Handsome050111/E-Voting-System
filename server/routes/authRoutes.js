const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyOTP,
    resendOTP,
    getUsers,
    deleteUser
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resettoken', resetPassword);

// Admin only routes
router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
