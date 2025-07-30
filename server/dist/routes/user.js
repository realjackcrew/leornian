"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const promptBuilder_1 = require("../llm/promptBuilder");
const router = (0, express_1.Router)();
// GET /api/user/profile - Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error('Get user profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/user/profile - Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, email, preferredName } = req.body;
        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await database_1.default.user.findUnique({
                where: { email }
            });
            if (existingUser && existingUser.id !== userId) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: email || undefined,
                preferredName: preferredName || undefined
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true
            }
        });
        res.json(updatedUser);
    }
    catch (err) {
        console.error('Update user profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/user/chat-settings - Get user's chat settings (voice, verbosity, model)
router.get('/chat-settings', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { settings: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Extract chat settings from the settings JSON, with defaults
        const settings = user.settings || {};
        const chatSettings = {
            voice: settings.voice || 'default',
            verbosity: settings.verbosity || 'balanced',
            model: settings.model || 'gpt-4o-mini'
        };
        res.json(chatSettings);
    }
    catch (err) {
        console.error('Get chat settings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/user/chat-settings - Update user's chat settings
router.put('/chat-settings', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { voice, verbosity, model } = req.body;
        // Validate voice
        if (voice && !(0, promptBuilder_1.getAvailableVoices)().includes(voice)) {
            res.status(400).json({ error: 'Invalid voice selection' });
            return;
        }
        // Validate verbosity  
        if (verbosity && !(0, promptBuilder_1.getAvailableVerbosities)().includes(verbosity)) {
            res.status(400).json({ error: 'Invalid verbosity selection' });
            return;
        }
        // Validate model
        const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'];
        if (model && !validModels.includes(model)) {
            res.status(400).json({ error: 'Invalid model selection' });
            return;
        }
        // Get current settings
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { settings: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Merge with existing settings
        const currentSettings = user.settings || {};
        const updatedSettings = {
            ...currentSettings,
            ...(voice && { voice }),
            ...(verbosity && { verbosity }),
            ...(model && { model })
        };
        // Update user settings
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { settings: updatedSettings },
            select: { settings: true }
        });
        // Return the updated chat settings
        const settings = updatedUser.settings || {};
        const chatSettings = {
            voice: settings.voice || 'default',
            verbosity: settings.verbosity || 'balanced',
            model: settings.model || 'gpt-4o-mini'
        };
        res.json(chatSettings);
    }
    catch (err) {
        console.error('Update chat settings error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/user/chat-options - Get available voice and verbosity options
router.get('/chat-options', (_req, res) => {
    try {
        res.json({
            voices: (0, promptBuilder_1.getAvailableVoices)(),
            verbosities: (0, promptBuilder_1.getAvailableVerbosities)(),
            models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini']
        });
    }
    catch (err) {
        console.error('Get chat options error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
