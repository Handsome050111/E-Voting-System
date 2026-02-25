const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailUtils');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return res.status(400).json({ message: 'Name must contain only letters and spaces' });
        }

        // Check if user exists
        const trimmedEmail = email.trim().toLowerCase();
        console.log(`Checking if user exists with email: ${trimmedEmail}`);
        const userExists = await User.findOne({ email: trimmedEmail });

        if (userExists) {
            if (userExists.isVerified) {
                console.log(`User already exists and is verified: ${trimmedEmail}`);
                return res.status(400).json({ message: 'User already exists' });
            }

            // User exists but is unverified - allow updating and re-sending OTP
            console.log(`Unverified user found: ${trimmedEmail}. Updating and re-sending OTP.`);
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const otpExpire = new Date(Date.now() + 1 * 60 * 1000);

            userExists.name = name;
            userExists.password = password; // Pre-save hook will hash this
            userExists.otp = otp;
            userExists.otpExpire = otpExpire;
            await userExists.save();

            const message = `Your verification code for VoteSecure is: ${otp}. This code will expire in 1 minute.`;
            try {
                await sendEmail({
                    email: userExists.email,
                    subject: 'Email Verification - VoteSecure',
                    message,
                });
                return res.status(200).json({
                    success: true,
                    message: 'New OTP sent to email. Please verify.',
                    email: userExists.email,
                });
            } catch (err) {
                console.error('Email error:', err);
                return res.status(200).json({
                    success: true,
                    message: 'Registration updated, but OTP email failed. Check console.',
                    email: userExists.email,
                    debugOtp: otp,
                });
            }

        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

        // Create user
        const user = await User.create({
            name,
            email: trimmedEmail,
            password,
            role: role || 'voter',
            otp,
            otpExpire,
            isVerified: false,
        });

        if (user) {
            // Send OTP Email
            const message = `Your verification code for VoteSecure is: ${otp}. This code will expire in 1 minute.`;
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Email Verification - VoteSecure',
                    message,
                });

                res.status(201).json({
                    success: true,
                    message: 'OTP sent to email. Please verify.',
                    email: user.email,
                });
            } catch (err) {
                console.error('Email error:', err);
                res.status(201).json({
                    success: true,
                    message: 'User registered, but OTP email failed. Please contact admin.',
                    email: user.email,
                    debugOtp: otp, // Temporarily include for dev if email fails
                });
            }

        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const trimmedEmail = email.trim().toLowerCase();
        // Check for user email
        const user = await User.findOne({ email: trimmedEmail });

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified && user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Please verify your email address first',
                    needsVerification: true,
                    email: user.email
                });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const crypto = require('crypto');
    const nodemailer = require('nodemailer');

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            // Create transporter (Using Ethereal for testing, or console log if fails)
            // ideally use environment variables for real SMTP
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: process.env.SMTP_PORT || 587,
                auth: {
                    user: process.env.SMTP_EMAIL || 'ethereal.user@email.com',
                    pass: process.env.SMTP_PASSWORD || 'etherealpassword'
                }
            });

            // For now, since we don't have real SMTP, we'll log it to console
            // and return success. In a real app, sendMail would be called.
            console.log('--------------------------------------------------');
            console.log(`Password Reset Link: ${resetUrl}`);
            console.log('--------------------------------------------------');

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('ForgotPass Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    const crypto = require('crypto');

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('ResetPass Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login.',
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('VerifyOTP Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 1 * 60 * 1000);
        await user.save();

        const message = `Your new verification code for VoteSecure is: ${otp}. This code will expire in 1 minute.`;
        try {
            await sendEmail({ email: user.email, subject: 'New Email Verification Code', message });
            res.status(200).json({ success: true, message: 'New OTP sent to email.' });
        } catch (err) {
            console.error('Email error:', err);
            res.status(200).json({ success: true, message: 'OTP regenerated, but email failed. Check console.', debugOtp: otp });
        }

    } catch (error) {
        console.error('ResendOTP Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('GetUsers Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('DeleteUser Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const deleteMe = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password to confirm deletion' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email !== email.trim().toLowerCase()) {
            return res.status(401).json({ message: 'Incorrect email address' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'Your account has been deleted permanently' });
    } catch (error) {
        console.error('DeleteMe Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyOTP,
    resendOTP,
    getUsers,
    deleteUser,
    deleteMe,
};
