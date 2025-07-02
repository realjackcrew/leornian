"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const whoop_1 = require("../healthData/whoop");
const router = (0, express_1.Router)();
// POST /whoop/auth - Handle WHOOP OAuth callback
router.post('/whoop/auth', auth_1.authenticateToken, async (req, res) => {
    try {
        const { authorizationCode } = req.body;
        if (!authorizationCode) {
            console.error('WHOOP auth: Missing authorization code');
            res.status(400).json({ error: 'Authorization code is required' });
            return;
        }
        console.log('WHOOP auth: Processing authorization code for user:', req.userId);
        console.log('WHOOP auth: Authorization code:', authorizationCode.substring(0, 20) + '...');
        // Initialize WHOOP API with the authorization code
        await whoop_1.whoopAPI.initialize(authorizationCode);
        // Get the tokens from the WHOOP API instance
        const tokens = {
            access_token: whoop_1.whoopAPI.getAccessToken(),
            refresh_token: whoop_1.whoopAPI.getRefreshToken(),
            expires_in: whoop_1.whoopAPI.getTokenExpiry() ? Math.floor((whoop_1.whoopAPI.getTokenExpiry() - Date.now()) / 1000) : null,
            token_type: 'Bearer'
        };
        console.log('WHOOP auth: Tokens received, storing in database');
        // Store the credentials in the database
        await database_1.default.user.update({
            where: { id: req.userId },
            data: {
                whoopCredentials: tokens
            }
        });
        console.log('WHOOP auth: Credentials stored successfully for user:', req.userId);
        res.json({
            success: true,
            message: 'WHOOP credentials stored successfully'
        });
    }
    catch (error) {
        console.error('WHOOP authentication error:', error);
        // Provide more detailed error information
        let errorMessage = 'Failed to authenticate with WHOOP';
        if (error.response?.data) {
            console.error('WHOOP API error details:', error.response.data);
            const whoopError = error.response.data;
            if (whoopError.error === 'invalid_grant') {
                if (whoopError.error_hint?.includes('already been used')) {
                    errorMessage = 'This authorization code has already been used. Please try connecting WHOOP again.';
                }
                else {
                    errorMessage = 'Authorization code is invalid or expired. Please try connecting WHOOP again.';
                }
            }
            else {
                errorMessage = `WHOOP API error: ${whoopError.error_description || whoopError.error || errorMessage}`;
            }
        }
        res.status(500).json({ error: errorMessage });
    }
});
// GET /whoop/status - Check if user has WHOOP credentials
router.get('/whoop/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.userId },
            select: { whoopCredentials: true }
        });
        const hasCredentials = user?.whoopCredentials !== null;
        res.json({
            hasCredentials,
            isConnected: hasCredentials
        });
    }
    catch (error) {
        console.error('Error checking WHOOP status:', error);
        res.status(500).json({ error: 'Failed to check WHOOP status' });
    }
});
// DELETE /whoop/disconnect - Remove WHOOP credentials
router.delete('/whoop/disconnect', auth_1.authenticateToken, async (req, res) => {
    try {
        await database_1.default.user.update({
            where: { id: req.userId },
            data: {
                whoopCredentials: undefined
            }
        });
        res.json({
            success: true,
            message: 'WHOOP credentials removed successfully'
        });
    }
    catch (error) {
        console.error('Error disconnecting WHOOP:', error);
        res.status(500).json({ error: 'Failed to disconnect WHOOP' });
    }
});
exports.default = router;
