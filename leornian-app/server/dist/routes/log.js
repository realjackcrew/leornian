"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// POST /log – create a new daily log
router.post('/log', auth_1.authenticateToken, async (req, res) => {
    const { focusScore, notes, sleepHours, hrv, strain, dietSummary, screenTime, healthData } = req.body;
    try {
        // Check if this is comprehensive health data or legacy format
        if (healthData) {
            // New comprehensive format
            const log = await db_1.default.dailyLog.create({
                data: {
                    userId: req.userId,
                    healthData: {
                        ...healthData,
                        timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
                    },
                    notes: healthData.notes || notes, // Extract notes from healthData if available
                },
            });
            console.log('Received comprehensive health log:', req.body);
            res.status(201).json(log);
        }
        else {
            // Legacy format for backward compatibility
            const log = await db_1.default.dailyLog.create({
                data: {
                    userId: req.userId,
                    focusScore,
                    notes,
                    sleepHours,
                    hrv,
                    strain,
                    dietSummary,
                    screenTime,
                    healthData: {
                        timezone: 'America/Chicago' // Add timezone for legacy entries
                    }
                },
            });
            console.log('Received legacy log:', req.body);
            res.status(201).json(log);
        }
    }
    catch (error) {
        console.error('Failed to create log:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});
// GET /logs – get all logs for current user
router.get('/log', auth_1.authenticateToken, async (req, res) => {
    try {
        const logs = await db_1.default.dailyLog.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Failed to fetch logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});
// PUT /log/:id – update an existing log
router.put('/log/:id', auth_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { focusScore, notes, sleepHours, hrv, strain, dietSummary, screenTime, healthData } = req.body;
    try {
        // Verify log belongs to user
        const existingLog = await db_1.default.dailyLog.findFirst({
            where: { id, userId: req.userId },
        });
        if (!existingLog) {
            res.status(404).json({ error: 'Log not found' });
            return;
        }
        // Update with comprehensive or legacy data
        const updateData = {};
        if (healthData) {
            updateData.healthData = {
                ...healthData,
                timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
            };
            updateData.notes = healthData.notes || notes;
        }
        else {
            updateData.focusScore = focusScore;
            updateData.notes = notes;
            updateData.sleepHours = sleepHours;
            updateData.hrv = hrv;
            updateData.strain = strain;
            updateData.dietSummary = dietSummary;
            updateData.screenTime = screenTime;
            updateData.healthData = {
                timezone: 'America/Chicago' // Add timezone for legacy entries
            };
        }
        const log = await db_1.default.dailyLog.update({
            where: { id },
            data: updateData,
        });
        res.json(log);
    }
    catch (error) {
        console.error('Failed to update log:', error);
        res.status(500).json({ error: 'Failed to update log' });
    }
});
exports.default = router;
