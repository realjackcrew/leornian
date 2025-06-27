"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        console.log('Register request received:', email);
        if (!email || !password) {
            console.warn('Missing email or password in request body');
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const existing = await db_1.default.user.findUnique({ where: { email } });
        if (existing) {
            console.log('Email already exists:', email);
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: {
                email,
                password: hashed,
                firstName,
                lastName
            }
        });
        console.log('User created with ID:', user.id);
        res.status(201).json({ userId: user.id });
    }
    catch (err) {
        console.error('Unexpected register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
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
exports.default = router;
