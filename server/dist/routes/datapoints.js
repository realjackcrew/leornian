"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userDatapoints = await database_1.default.userDatapoint.findMany({
            where: { userId },
        });
        const definitions = {};
        const preferences = {};
        userDatapoints.forEach(dp => {
            if (!definitions[dp.category]) {
                definitions[dp.category] = {};
                preferences[dp.category] = {};
            }
            definitions[dp.category][dp.name] = {
                type: dp.type,
                label: dp.label,
                min: dp.min,
                max: dp.max,
                step: dp.step,
            };
            // For now, all datapoints are considered enabled.
            // This will be updated later to reflect the user's actual preferences.
            preferences[dp.category][dp.name] = dp.enabled;
        });
        res.json({
            definitions,
            preferences,
            custom: [], // This can be deprecated on the frontend later
        });
    }
    catch (err) {
        console.error('Get datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/enabled', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const userDatapoints = await database_1.default.userDatapoint.findMany({
            where: { userId, enabled: true },
        });
        const enabledDatapoints = {};
        userDatapoints.forEach(dp => {
            if (!enabledDatapoints[dp.category]) {
                enabledDatapoints[dp.category] = {};
            }
            enabledDatapoints[dp.category][dp.name] = {
                type: dp.type,
                label: dp.label,
                min: dp.min,
                max: dp.max,
                step: dp.step,
            };
        });
        res.json(enabledDatapoints);
    }
    catch (err) {
        console.error('Get enabled datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/enabled', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== 'object') {
            res.status(400).json({ error: 'Invalid preferences format' });
            return;
        }
        await database_1.default.$transaction(async (tx) => {
            for (const category in preferences) {
                for (const datapointName in preferences[category]) {
                    const enabled = preferences[category][datapointName];
                    await tx.userDatapoint.updateMany({
                        where: {
                            userId,
                            category,
                            name: datapointName,
                        },
                        data: {
                            enabled,
                        },
                    });
                }
            }
        });
        res.json({ message: 'Datapoint preferences saved successfully' });
    }
    catch (err) {
        console.error('Save datapoint preferences error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { category, name: providedName, label, type, min, max, step } = req.body;
        if (!category || !label || !type || !providedName) {
            res.status(400).json({ error: 'Missing required datapoint fields: category, name, label, and type are required' });
            return;
        }
        // Generate a unique name for the datapoint if not provided
        const name = providedName || `${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const newDatapoint = await database_1.default.userDatapoint.create({
            data: {
                userId,
                category,
                name,
                label,
                type,
                min,
                max,
                step,
                enabled: true, // New datapoints are enabled by default
            },
        });
        res.status(201).json(newDatapoint);
    }
    catch (err) {
        console.error('Create datapoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { datapoints } = req.body; // Expecting an array of { category, name }
        if (!datapoints || !Array.isArray(datapoints)) {
            res.status(400).json({ error: 'Invalid request body' });
            return;
        }
        await database_1.default.$transaction(async (tx) => {
            for (const dp of datapoints) {
                await tx.userDatapoint.deleteMany({
                    where: {
                        userId,
                        category: dp.category,
                        name: dp.name,
                    },
                });
            }
        });
        res.json({ message: 'Datapoints deleted successfully' });
    }
    catch (err) {
        console.error('Delete datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:category/:name', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { name } = req.params;
        const { label, type, min, max, step } = req.body;
        if (!label || !type) {
            res.status(400).json({ error: 'Missing required fields: label and type are required' });
            return;
        }
        const updatedDatapoint = await database_1.default.userDatapoint.update({
            where: {
                userId_name: {
                    userId,
                    name,
                },
            },
            data: {
                label,
                type,
                min,
                max,
                step,
            },
        });
        res.json(updatedDatapoint);
    }
    catch (err) {
        console.error('Update datapoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/category/:category', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { category } = req.params;
        await database_1.default.userDatapoint.deleteMany({
            where: {
                userId,
                category,
            },
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/reset', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        // Import the master datapoint definitions
        const { masterDatapointDefinitions } = require('../llm/datapointDefinitions');
        // Get current user datapoints
        const currentUserDatapoints = await database_1.default.userDatapoint.findMany({
            where: { userId },
        });
        // Create a set of master datapoint names for quick lookup
        const masterDatapointNames = new Set();
        for (const category in masterDatapointDefinitions) {
            for (const name in masterDatapointDefinitions[category]) {
                masterDatapointNames.add(name);
            }
        }
        // Identify custom datapoints (not in master list) to delete
        const customDatapointsToDelete = currentUserDatapoints.filter(dp => !masterDatapointNames.has(dp.name));
        // Delete only custom datapoints
        if (customDatapointsToDelete.length > 0) {
            await database_1.default.userDatapoint.deleteMany({
                where: {
                    userId,
                    name: {
                        in: customDatapointsToDelete.map(dp => dp.name)
                    }
                },
            });
        }
        // Get current user datapoints after deletion
        const remainingUserDatapoints = await database_1.default.userDatapoint.findMany({
            where: { userId },
        });
        // Create a set of existing datapoint names for quick lookup
        const existingDatapointNames = new Set(remainingUserDatapoints.map(dp => dp.name));
        // Add any missing master datapoints
        const datapointsToCreate = [];
        for (const category in masterDatapointDefinitions) {
            for (const name in masterDatapointDefinitions[category]) {
                if (!existingDatapointNames.has(name)) {
                    const definition = masterDatapointDefinitions[category][name];
                    datapointsToCreate.push({
                        userId,
                        category,
                        name,
                        label: definition.label,
                        type: definition.type,
                        min: definition.min,
                        max: definition.max,
                        step: definition.step,
                        enabled: true, // All default datapoints are enabled by default
                    });
                }
            }
        }
        if (datapointsToCreate.length > 0) {
            await database_1.default.userDatapoint.createMany({
                data: datapointsToCreate,
            });
        }
        res.json({
            message: 'Datapoints reset to default successfully',
            deletedCustom: customDatapointsToDelete.length,
            addedMissing: datapointsToCreate.length
        });
    }
    catch (err) {
        console.error('Reset datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
