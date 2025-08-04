"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const database_1 = __importDefault(require("../db/database"));
const resend_1 = require("../resend");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
const resetTokens = new Map();
const verificationCodes = new Map();
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, verificationToken } = req.body;
        if (!email || !password || !verificationToken) {
            res.status(400).json({ error: 'Email, password, and verification token are required' });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(verificationToken, JWT_SECRET);
            if (decoded.email !== email || decoded.purpose !== 'register' || decoded.type !== 'email_verification') {
                res.status(400).json({ error: 'Invalid verification token' });
                return;
            }
        }
        catch (e) {
            res.status(400).json({ error: 'Invalid or expired verification token' });
            return;
        }
        const existing = await database_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashed,
                firstName: firstName || '',
                lastName: lastName || ''
            }
        });
        res.status(201).json({ userId: user.id });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const user = await database_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        }
    });
});
router.post('/google-auth', async (req, res) => {
    try {
        const { idToken, rememberMe } = req.body;
        if (!idToken) {
            res.status(400).json({ error: 'ID token is required' });
            return;
        }
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const { email, given_name, family_name, sub: googleId } = payload;
        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        let user = await database_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await database_1.default.user.create({
                data: {
                    email,
                    firstName: given_name || '',
                    lastName: family_name || '',
                    password: `google_${googleId}`
                }
            });
        }
        else if (!user.password?.startsWith('google_')) {
            user = await database_1.default.user.update({
                where: { id: user.id },
                data: { password: `google_${googleId}` }
            });
        }
        const expiresIn = rememberMe ? '30d' : '2h';
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    }
    catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (user) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 15 * 60 * 1000;
            resetTokens.set(email, { code, expiresAt });
            await (0, resend_1.sendVerificationEmail)(email, code, 'reset');
        }
        res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({ error: 'Email and code are required' });
            return;
        }
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: 'Invalid code' });
            return;
        }
        const storedReset = resetTokens.get(email);
        if (!storedReset || storedReset.code !== code || Date.now() > storedReset.expiresAt) {
            res.status(400).json({ error: 'Invalid code' });
            return;
        }
        resetTokens.delete(email);
        const verificationToken = jsonwebtoken_1.default.sign({ email, type: 'password_reset_verification' }, JWT_SECRET, { expiresIn: '5m' });
        res.json({ verificationToken });
    }
    catch (err) {
        console.error('Verify reset code error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword, verificationToken } = req.body;
        if (!email || !newPassword || !verificationToken) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(verificationToken, JWT_SECRET);
            if (decoded.email !== email ||
                !((decoded.type === 'password_reset_verification') ||
                    (decoded.type === 'email_verification' && decoded.purpose === 'reset'))) {
                res.status(400).json({ error: 'Invalid verification token' });
                return;
            }
        }
        catch (jwtError) {
            res.status(400).json({ error: 'Invalid or expired verification token' });
            return;
        }
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: 'Invalid request' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await database_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password reset successful' });
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/send-verification-code', async (req, res) => {
    try {
        const { email, purpose } = req.body;
        if (!email || !['register', 'reset'].includes(purpose)) {
            return res.status(400).json({ error: 'Email and valid purpose are required' });
        }
        if (purpose === 'register') {
            const existing = await database_1.default.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }
        if (purpose === 'reset') {
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return res.json({ message: 'If an account with that email exists, a code has been sent.' });
            }
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;
        verificationCodes.set(email, { code, expiresAt, purpose });
        await (0, resend_1.sendVerificationEmail)(email, code, purpose);
        return res.json({ message: 'Verification code sent.' });
    }
    catch (err) {
        console.error('Send verification code error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code, purpose } = req.body;
        if (!email || !code || !['register', 'reset'].includes(purpose)) {
            return res.status(400).json({ error: 'Email, code, and valid purpose are required' });
        }
        const stored = verificationCodes.get(email);
        if (!stored || stored.code !== code || stored.purpose !== purpose || Date.now() > stored.expiresAt) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }
        verificationCodes.delete(email);
        const verificationToken = jsonwebtoken_1.default.sign({ email, purpose, type: 'email_verification' }, JWT_SECRET, { expiresIn: '10m' });
        return res.json({ verificationToken });
    }
    catch (err) {
        console.error('Verify code error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
