"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const passport_oauth2_1 = require("passport-oauth2");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../db/database"));
const whoop_1 = require("../healthData/whoop");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const whoopCallbackUrl = process.env.WHOOP_REDIRECT_URI || process.env.WHOOP_CALLBACK_URL;
const startWhoopAuth = (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).send('Authentication token missing');
    }
    try {
        jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return passport_1.default.authenticate('whoop', {
            state: token,
            session: false,
            scope: whoopOptions.scope
        })(req, res, next);
    }
    catch (err) {
        console.error('[WHOOP Auth] Token verification failed', err);
        return res.status(401).send('Invalid authentication token');
    }
};
const whoopCallbackSuccess = (_req, res, _next) => {
    res.redirect(`${clientUrl}/settings?whoopAuth=success`);
};
const whoopVerify = async (req, accessToken, refreshToken, params, profile, done) => {
    try {
        const state = req.query.state;
        if (!state) {
            console.error('[WHOOP Verify] Missing state parameter');
            return done(new Error('State parameter missing'));
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(state, JWT_SECRET);
        }
        catch (err) {
            console.error('[WHOOP Verify] Failed to decode state token', err);
            return done(new Error('Invalid state token'));
        }
        const userId = decoded.userId;
        const whoopUserId = profile.user_id;
        try {
            await database_1.default.user.update({
                where: { id: userId },
                data: {
                    whoopAccessToken: accessToken,
                    whoopRefreshToken: refreshToken,
                    whoopTokenExpiresAt: new Date(Date.now() + (params?.expires_in ?? 0) * 1000),
                    whoopUserId: String(whoopUserId),
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                },
            });
        }
        catch (dbErr) {
            console.error('[WHOOP Verify] Failed to update user with WHOOP credentials', dbErr);
            return done(new Error('Failed to store WHOOP credentials'));
        }
        done(null, profile);
    }
    catch (err) {
        console.error('[WHOOP Verify] Unexpected error during verification', err);
        done(err);
    }
};
const whoopOptions = {
    authorizationURL: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenURL: 'https://api.prod.whoop.com/oauth/oauth2/token',
    clientID: process.env.WHOOP_CLIENT_ID,
    clientSecret: process.env.WHOOP_CLIENT_SECRET,
    callbackURL: whoopCallbackUrl,
    passReqToCallback: true,
    scope: [
        'offline',
        'read:profile',
        'read:cycles',
        'read:recovery',
        'read:sleep',
        'read:workout',
    ],
};
passport_1.default.use('whoop', new passport_oauth2_1.Strategy(whoopOptions, whoopVerify));
router.use(passport_1.default.initialize());
const whoopCallbackError = (err, req, res, _next) => {
    console.error('[WHOOP Callback] Authentication error', {
        error: err.message,
        stack: err.stack,
        userId: req.userId
    });
    res.redirect(`${clientUrl}/settings?whoopAuth=failed&reason=${encodeURIComponent(err.message)}`);
};
const whoopAuthMiddleware = passport_1.default.authenticate('whoop', {
    failureRedirect: `${clientUrl}/settings?whoopAuth=failed`,
    session: false
});
router.get('/auth/whoop', auth_1.authenticateToken, startWhoopAuth);
router.get('/auth/whoop/callback', whoopAuthMiddleware, whoopCallbackSuccess);
router.use('/auth/whoop/callback', whoopCallbackError);
router.get('/whoop/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.userId },
            select: { whoopAccessToken: true }
        });
        const hasCredentials = !!user?.whoopAccessToken;
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
router.delete('/whoop/disconnect', auth_1.authenticateToken, async (req, res) => {
    try {
        await database_1.default.user.update({
            where: { id: req.userId },
            data: {
                whoopAccessToken: null,
                whoopRefreshToken: null,
                whoopTokenExpiresAt: null,
                whoopUserId: null
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
router.get('/whoop/data', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                whoopAccessToken: true,
                whoopRefreshToken: true,
                whoopTokenExpiresAt: true,
            }
        });
        if (!user || !user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
            return res.status(400).json({ error: 'No WHOOP credentials found for user' });
        }
        let { whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt } = user;
        const api = whoop_1.whoopAPI;
        api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const searchStartDate = new Date(`${date}T00:00:00.000Z`);
        searchStartDate.setDate(searchStartDate.getDate() - 3);
        const searchEndDate = new Date(`${date}T23:59:59.999Z`);
        searchEndDate.setDate(searchEndDate.getDate() + 1);
        const startISO = searchStartDate.toISOString();
        const endISO = searchEndDate.toISOString();
        const cycles = await api.getCyclesInDateRange(startISO, endISO);
        if (!cycles || cycles.length === 0) {
            return res.json({ success: true, data: {}, message: 'No WHOOP cycles found for this date range.' });
        }
        const targetDate = date;
        let targetCycle = null;
        targetCycle = cycles.find((c) => c.start && c.start.startsWith(targetDate));
        if (!targetCycle) {
            const validCycles = cycles
                .filter((c) => c.start && c.start.split('T')[0] <= targetDate)
                .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
            targetCycle = validCycles[0];
        }
        if (!targetCycle) {
            return res.json({ success: true, data: {}, message: 'Could not find a matching WHOOP cycle for this date.' });
        }
        let [recoveryData, workouts] = await Promise.all([
            api.getRecoveryForCycle(targetCycle.id),
            api.getWorkoutsInDateRange(startISO, endISO)
        ]);
        let sleepData = null;
        if (recoveryData && recoveryData.sleep_id) {
            sleepData = await api.getSleepById(recoveryData.sleep_id);
        }
        else if (recoveryData && recoveryData.score && recoveryData.score.sleep_id) {
            sleepData = await api.getSleepById(recoveryData.score.sleep_id);
        }
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== whoopAccessToken) {
            await database_1.default.user.update({
                where: { id: req.userId },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
        }
        const targetWorkouts = workouts.filter((w) => w.start.startsWith(date));
        const result = {};
        const missingData = [];
        if (sleepData && sleepData.score) {
            const getLocalTime = (isoString, offset) => {
                if (!isoString)
                    return '';
                const date = new Date(isoString);
                if (!offset)
                    return date.toISOString().substring(11, 16);
                return date.toTimeString().substring(0, 5);
            };
            result.bedtime = getLocalTime(sleepData.start, sleepData.timezone_offset);
            result.wakeTime = getLocalTime(sleepData.end, sleepData.timezone_offset);
            result.sleepEfficiencyPercent = Math.round(sleepData.score.sleep_efficiency_percentage);
            result.sleepPerformancePercent = sleepData.score.sleep_performance_percentage;
            result.sleepConsistencyPercent = Math.round(sleepData.score.sleep_consistency_percentage);
            let sleepFulfillmentPercent = null;
            const totalInBedMilli = sleepData.score?.stage_summary?.total_in_bed_time_milli;
            const totalAwakeMilli = sleepData.score?.stage_summary?.total_awake_time_milli;
            const baselineMilli = sleepData.score?.sleep_needed?.baseline_milli || sleepData.sleep_needed?.baseline_milli;
            if (totalInBedMilli != null && totalAwakeMilli != null && baselineMilli != null) {
                const totalSleepMilli = totalInBedMilli - totalAwakeMilli;
                sleepFulfillmentPercent = Math.round((totalSleepMilli / baselineMilli) * 100);
            }
            else {
            }
            result.sleepFulfillmentPercent = sleepFulfillmentPercent;
            let sleepDebtRaw = null;
            if (sleepData.score.sleep_needed?.need_from_sleep_debt_milli != null) {
                sleepDebtRaw = sleepData.score.sleep_needed.need_from_sleep_debt_milli;
            }
            else if (sleepData.sleep_needed?.need_from_sleep_debt_milli != null) {
                sleepDebtRaw = sleepData.sleep_needed.need_from_sleep_debt_milli;
            }
            if (sleepDebtRaw != null) {
                result.sleepDebtMinutes = Math.round(sleepDebtRaw / 60000);
            }
            else {
                result.sleepDebtMinutes = 0;
            }
        }
        else {
            missingData.push('sleep');
        }
        if (workouts && workouts.length > 0) {
            result.didStrengthTrainingWorkout = targetWorkouts.some((w) => w.sport_name && w.sport_name.toLowerCase().includes('strength'));
            result.wentForRun = targetWorkouts.some((w) => w.sport_name && w.sport_name.toLowerCase().includes('run'));
        }
        else {
            missingData.push('workouts');
        }
        result.whoopStrainScore = targetCycle.score?.strain != null ? Number(targetCycle.score.strain.toFixed(2)) : null;
        if (recoveryData && recoveryData.score) {
            result.restingHR = recoveryData.score.resting_heart_rate;
            result.heartRateVariability = recoveryData.score.hrv_rmssd_milli != null ? Math.round(recoveryData.score.hrv_rmssd_milli) : null;
            result.whoopRecoveryScorePercent = recoveryData.score.recovery_score;
        }
        else {
            missingData.push('recovery');
        }
        return res.json({
            success: true,
            data: result,
            missingData: missingData,
            hasAnyData: Object.keys(result).length > 0
        });
    }
    catch (error) {
        console.error('Error fetching WHOOP data for log:', error);
        return res.status(500).json({ error: 'Failed to fetch WHOOP data' });
    }
});
router.get('/whoop/raw', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                whoopAccessToken: true,
                whoopRefreshToken: true,
                whoopTokenExpiresAt: true,
            }
        });
        if (!user || !user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
            return res.status(400).json({ error: 'No WHOOP credentials found for user' });
        }
        let { whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt } = user;
        const api = whoop_1.whoopAPI;
        api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());
        const start = req.query.start;
        const end = req.query.end;
        if (!start || !end) {
            return res.status(400).json({ error: 'Missing start or end date (YYYY-MM-DD)' });
        }
        const cycles = await api.getCyclesInDateRange(start, end);
        const sleep = await Promise.all(cycles.map(cycle => api.getSleepForCycle(cycle.id).catch(() => null)));
        const recovery = await Promise.all(cycles.map(cycle => api.getRecoveryForCycle(cycle.id).catch(() => null)));
        const workouts = await api.getWorkoutsInDateRange(start, end);
        return res.json({
            cycles,
            sleep: sleep.filter(Boolean),
            recovery: recovery.filter(Boolean),
            workouts
        });
    }
    catch (error) {
        console.error('Error fetching raw WHOOP data:', error);
        return res.status(500).json({ error: 'Failed to fetch raw WHOOP data' });
    }
});
router.get('/whoop/debug', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                whoopAccessToken: true,
                whoopRefreshToken: true,
                whoopTokenExpiresAt: true,
                whoopUserId: true,
                firstName: true,
                lastName: true,
            }
        });
        if (!user) {
            return res.json({
                success: false,
                step: 'user_lookup',
                message: 'User not found in database',
                debug: { userId: req.userId }
            });
        }
        const debugInfo = {
            success: true,
            steps: [],
            user: {
                hasAccessToken: !!user.whoopAccessToken,
                hasRefreshToken: !!user.whoopRefreshToken,
                hasTokenExpiry: !!user.whoopTokenExpiresAt,
                hasWhoopUserId: !!user.whoopUserId,
                tokenExpiresAt: user.whoopTokenExpiresAt?.toISOString(),
                isTokenExpired: user.whoopTokenExpiresAt ? Date.now() >= user.whoopTokenExpiresAt.getTime() : null,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        };
        if (!user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
            debugInfo.steps.push({
                step: 'credentials_check',
                success: false,
                message: 'Missing WHOOP credentials - need to connect account',
                missing: {
                    accessToken: !user.whoopAccessToken,
                    refreshToken: !user.whoopRefreshToken,
                    expiresAt: !user.whoopTokenExpiresAt
                }
            });
            return res.json(debugInfo);
        }
        debugInfo.steps.push({
            step: 'credentials_check',
            success: true,
            message: 'WHOOP credentials found'
        });
        const isExpired = Date.now() >= user.whoopTokenExpiresAt.getTime() - 5 * 60 * 1000;
        debugInfo.steps.push({
            step: 'token_expiry_check',
            success: !isExpired,
            message: isExpired ? 'Token is expired or close to expiry' : 'Token is still valid',
            details: {
                expiresAt: user.whoopTokenExpiresAt.toISOString(),
                expiresInMs: user.whoopTokenExpiresAt.getTime() - Date.now(),
                needsRefresh: isExpired
            }
        });
        const api = whoop_1.whoopAPI;
        api.setTokens(user.whoopAccessToken, user.whoopRefreshToken, user.whoopTokenExpiresAt.getTime());
        debugInfo.steps.push({
            step: 'api_setup',
            success: true,
            message: 'WHOOP API configured with tokens'
        });
        try {
            const profile = await api.getUserProfile();
            debugInfo.steps.push({
                step: 'profile_test',
                success: true,
                message: 'Successfully fetched user profile',
                data: profile,
                critical: false
            });
        }
        catch (profileError) {
            debugInfo.steps.push({
                step: 'profile_test',
                success: false,
                message: 'Profile endpoint not available (non-critical for v2 API)',
                error: {
                    message: profileError.message,
                    status: profileError.response?.status,
                    data: profileError.response?.data,
                    url: profileError.config?.url
                },
                critical: false
            });
        }
        try {
            const testDate = new Date();
            const dateRangesToTest = [
                { days: 7, label: '7 days' },
                { days: 30, label: '30 days' },
                { days: 60, label: '60 days' },
                { days: 90, label: '90 days' }
            ];
            let cycles = [];
            let successfulRange = null;
            for (const range of dateRangesToTest) {
                const startDate = new Date(testDate.getTime() - range.days * 24 * 60 * 60 * 1000);
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = testDate.toISOString().split('T')[0];
                try {
                    const testCycles = await api.getCyclesInDateRange(startDateStr, endDateStr);
                    if (testCycles && testCycles.length > 0) {
                        cycles = testCycles;
                        successfulRange = { ...range, start: startDateStr, end: endDateStr };
                        break;
                    }
                }
                catch (rangeError) {
                }
            }
            debugInfo.steps.push({
                step: 'cycles_test',
                success: true,
                message: `Successfully connected to WHOOP. Found ${cycles.length} cycles${successfulRange ? ` in ${successfulRange.label}` : ' (tested multiple ranges)'}`,
                data: {
                    testedRanges: dateRangesToTest.map(r => `${r.days} days`),
                    successfulRange,
                    totalCycles: cycles.length,
                    cycles: cycles.slice(0, 2),
                    hasData: cycles.length > 0
                },
                critical: true
            });
        }
        catch (cyclesError) {
            const isAuthError = cyclesError.response?.status === 401 || cyclesError.response?.status === 403;
            debugInfo.steps.push({
                step: 'cycles_test',
                success: false,
                message: isAuthError ? 'Authentication failed for cycles' : 'Cycles endpoint accessible but no data',
                error: {
                    message: cyclesError.message,
                    status: cyclesError.response?.status,
                    statusText: cyclesError.response?.statusText,
                    data: cyclesError.response?.data,
                    url: cyclesError.config?.url,
                    method: cyclesError.config?.method,
                    params: cyclesError.config?.params,
                    fullError: cyclesError.toString()
                },
                critical: isAuthError
            });
        }
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== user.whoopAccessToken) {
            debugInfo.steps.push({
                step: 'token_refresh',
                success: true,
                message: 'Tokens were automatically refreshed during requests'
            });
            await database_1.default.user.update({
                where: { id: req.userId },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
        }
        else {
            debugInfo.steps.push({
                step: 'token_refresh',
                success: true,
                message: 'No token refresh was needed'
            });
        }
        return res.json(debugInfo);
    }
    catch (error) {
        console.error('[DEBUG] Error in WHOOP debug endpoint:', error);
        return res.status(500).json({
            success: false,
            step: 'debug_endpoint_error',
            message: 'Error in debug endpoint',
            error: error.message
        });
    }
});
router.get('/whoop/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                whoopAccessToken: true,
                whoopRefreshToken: true,
                whoopTokenExpiresAt: true,
                whoopUserId: true,
                firstName: true,
                lastName: true
            }
        });
        if (!user?.whoopAccessToken) {
            return res.status(400).json({
                error: 'WHOOP account not connected',
                details: 'No WHOOP access token found for this user'
            });
        }
        const api = whoop_1.whoopAPI;
        api.setTokens(user.whoopAccessToken, user.whoopRefreshToken || '', user.whoopTokenExpiresAt ? user.whoopTokenExpiresAt.getTime() : Date.now() + 3600000);
        const profile = await api.getUserProfile();
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== user.whoopAccessToken) {
            await database_1.default.user.update({
                where: { id: userId },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
        }
        return res.json(profile);
    }
    catch (error) {
        console.error(`[PROFILE] Error fetching WHOOP profile:`, error);
        if (error.response?.status === 401) {
            return res.status(401).json({
                error: 'WHOOP authentication failed',
                details: error.response?.data || error.message,
                suggestion: 'Please reconnect your WHOOP account'
            });
        }
        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'WHOOP profile not found',
                details: error.response?.data || error.message,
                status: error.response?.status
            });
        }
        return res.status(500).json({
            error: 'Failed to fetch WHOOP profile',
            details: error.message,
            status: error.response?.status
        });
    }
});
exports.default = router;
