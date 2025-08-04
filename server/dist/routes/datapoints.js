"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const datapointDefinitions_1 = require("../llm/datapointDefinitions");
const router = (0, express_1.Router)();
const baselineDatapointDefinitions = JSON.parse(JSON.stringify(datapointDefinitions_1.masterDatapointDefinitions));
router.get('/definitions', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const allDefinitions = JSON.parse(JSON.stringify(baselineDatapointDefinitions));
        const customDatapoints = await database_1.default.datapointPreference.findMany({
            where: {
                userId,
                category: {
                    in: Object.keys(datapointDefinitions_1.masterDatapointDefinitions)
                },
                datapoint: {
                    startsWith: '{'
                }
            },
            select: {
                category: true,
                datapoint: true
            }
        });
        customDatapoints.forEach(pref => {
            if (typeof pref.datapoint === 'string' && pref.datapoint.trim().startsWith('{')) {
                try {
                    const definition = JSON.parse(pref.datapoint);
                    const category = pref.category;
                    if (!allDefinitions[category]) {
                        allDefinitions[category] = {};
                    }
                    allDefinitions[category][definition.name] = {
                        type: definition.type,
                        label: definition.label,
                        description: definition.description,
                        min: definition.min,
                        max: definition.max,
                        step: definition.step
                    };
                }
                catch (e) {
                    console.error('Failed to parse custom datapoint definition:', e);
                }
            }
        });
        res.json(allDefinitions);
    }
    catch (err) {
        console.error('Get datapoint definitions error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const preferences = await database_1.default.datapointPreference.findMany({
            where: { userId },
            select: {
                category: true,
                datapoint: true,
                enabled: true
            }
        });
        const preferencesMap = {};
        preferences.forEach(pref => {
            if (!preferencesMap[pref.category]) {
                preferencesMap[pref.category] = {};
            }
            preferencesMap[pref.category][pref.datapoint] = pref.enabled;
        });
        const customDefinitions = await database_1.default.datapointPreference.findMany({
            where: {
                userId,
                category: { in: Object.keys(datapointDefinitions_1.masterDatapointDefinitions) },
                datapoint: { startsWith: '{' }
            },
            select: { category: true, datapoint: true }
        });
        const validCustomNames = new Set(customDefinitions.map(pref => {
            try {
                return JSON.parse(pref.datapoint).name;
            }
            catch {
                return null;
            }
        }).filter(Boolean));
        Object.keys(preferencesMap).forEach(category => {
            Object.keys(preferencesMap[category]).forEach(datapoint => {
                if (datapoint.startsWith('custom') && !validCustomNames.has(datapoint)) {
                    delete preferencesMap[category][datapoint];
                }
            });
        });
        res.json(preferencesMap);
    }
    catch (err) {
        console.error('Get datapoint preferences error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/preferences', auth_1.authenticateToken, async (req, res) => {
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
            await tx.datapointPreference.deleteMany({
                where: {
                    userId,
                    OR: [
                        {
                            category: {
                                notIn: Object.keys(datapointDefinitions_1.masterDatapointDefinitions)
                            }
                        },
                        {
                            datapoint: {
                                not: {
                                    startsWith: '{'
                                }
                            }
                        }
                    ]
                }
            });
            const preferencesToInsert = [];
            const validCustomDatapoints = await tx.datapointPreference.findMany({
                where: {
                    userId,
                    category: { in: Object.keys(datapointDefinitions_1.masterDatapointDefinitions) },
                    datapoint: { startsWith: '{' }
                },
                select: { category: true, datapoint: true }
            });
            const validCustomNames = new Set(validCustomDatapoints.map(pref => {
                try {
                    return JSON.parse(pref.datapoint).name;
                }
                catch {
                    return null;
                }
            }).filter(Boolean));
            Object.entries(preferences).forEach(([category, datapoints]) => {
                if (typeof datapoints === 'object' && datapoints !== null) {
                    Object.entries(datapoints).forEach(([datapoint, enabled]) => {
                        if (typeof enabled === 'boolean' && category && datapoint) {
                            if (datapoint.startsWith('custom') && !validCustomNames.has(datapoint)) {
                                return;
                            }
                            preferencesToInsert.push({
                                userId,
                                category,
                                datapoint,
                                enabled
                            });
                        }
                    });
                }
            });
            if (preferencesToInsert.length > 0) {
                await tx.datapointPreference.createMany({
                    data: preferencesToInsert
                });
            }
        });
        res.json({ message: 'Datapoint preferences saved successfully' });
    }
    catch (err) {
        console.error('Save datapoint preferences error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/enabled', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const preferences = await database_1.default.datapointPreference.findMany({
            where: {
                userId,
                enabled: true
            },
            select: {
                category: true,
                datapoint: true
            }
        });
        if (preferences.length === 0) {
            res.json(datapointDefinitions_1.masterDatapointDefinitions);
            return;
        }
        const enabledDatapoints = {};
        preferences.forEach(pref => {
            if (!enabledDatapoints[pref.category]) {
                enabledDatapoints[pref.category] = {};
            }
            const category = pref.category;
            const datapoint = pref.datapoint;
            if (datapoint.startsWith('{')) {
                try {
                    const definition = JSON.parse(datapoint);
                    enabledDatapoints[category][definition.name] = {
                        type: definition.type,
                        label: definition.label,
                        description: definition.description,
                        min: definition.min,
                        max: definition.max,
                        step: definition.step
                    };
                }
                catch (e) {
                    console.error('Failed to parse custom datapoint definition:', e);
                }
            }
            else {
                const categoryDefinitions = datapointDefinitions_1.masterDatapointDefinitions[category];
                if (categoryDefinitions && categoryDefinitions[datapoint]) {
                    enabledDatapoints[category][datapoint] = categoryDefinitions[datapoint];
                }
            }
        });
        res.json(enabledDatapoints);
    }
    catch (err) {
        console.error('Get enabled datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/custom', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { label, type, description, min, max, step, category } = req.body;
        if (!label || !type || !category) {
            res.status(400).json({ error: 'Label, type, and category are required' });
            return;
        }
        if (!datapointDefinitions_1.masterDatapointDefinitions[category]) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const generateName = (label) => {
            return 'custom' + label
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        };
        const name = generateName(label);
        const definition = {
            name,
            label,
            type,
            description: description || '',
            min: type === 'number' ? (min || 0) : undefined,
            max: type === 'number' ? (max || 100) : undefined,
            step: type === 'number' ? (step || 1) : undefined,
            category
        };
        const existing = await database_1.default.datapointPreference.findFirst({
            where: {
                userId,
                category,
                datapoint: JSON.stringify(definition)
            }
        });
        if (existing) {
            res.status(400).json({ error: 'A custom datapoint with this name already exists in this category' });
            return;
        }
        await database_1.default.datapointPreference.create({
            data: {
                userId,
                category,
                datapoint: JSON.stringify(definition),
                enabled: true
            }
        });
        res.json({
            message: 'Custom datapoint created successfully',
            datapoint: definition
        });
    }
    catch (err) {
        console.error('Create custom datapoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/custom/:category/:name', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { category, name } = req.params;
        console.log('Attempting to delete custom datapoint:', { userId, category, name });
        if (!datapointDefinitions_1.masterDatapointDefinitions[category]) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const deleted = await database_1.default.datapointPreference.deleteMany({
            where: {
                userId,
                category,
                OR: [
                    {
                        datapoint: {
                            contains: `"name":"${name}"`
                        }
                    },
                    {
                        datapoint: name
                    }
                ]
            }
        });
        console.log('Delete result:', deleted);
        if (deleted.count === 0) {
            const existingCustomDatapoints = await database_1.default.datapointPreference.findMany({
                where: {
                    userId,
                    category,
                    datapoint: {
                        startsWith: '{'
                    }
                },
                select: {
                    datapoint: true
                }
            });
            console.log('Existing custom datapoints in category:', category, existingCustomDatapoints);
            res.status(404).json({ error: 'Custom datapoint not found' });
            return;
        }
        res.json({ message: 'Custom datapoint deleted successfully' });
    }
    catch (err) {
        console.error('Delete custom datapoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/custom', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const customDatapoints = await database_1.default.datapointPreference.findMany({
            where: {
                userId,
                category: {
                    in: Object.keys(datapointDefinitions_1.masterDatapointDefinitions)
                },
                datapoint: {
                    startsWith: '{'
                }
            },
            select: {
                category: true,
                datapoint: true,
                enabled: true
            }
        });
        const parsedDatapoints = customDatapoints.map(pref => {
            try {
                const definition = JSON.parse(pref.datapoint);
                return {
                    ...definition,
                    category: pref.category,
                    enabled: pref.enabled
                };
            }
            catch (e) {
                console.error('Failed to parse custom datapoint:', e);
                return null;
            }
        }).filter(Boolean);
        res.json(parsedDatapoints);
    }
    catch (err) {
        console.error('Get custom datapoints error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
