"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoopAPI = exports.WhoopAPI = void 0;
exports.getWhoopAuthUrl = getWhoopAuthUrl;
exports.handleWhoopCallback = handleWhoopCallback;
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../db/database"));
const simple_oauth2_1 = require("simple-oauth2");
const whoopOauthConfig = {
    client: {
        id: process.env.WHOOP_CLIENT_ID || '',
        secret: process.env.WHOOP_CLIENT_SECRET || '',
    },
    auth: {
        tokenHost: 'https://api.prod.whoop.com',
        tokenPath: '/oauth/oauth2/token',
        authorizePath: '/oauth/oauth2/auth',
    },
    options: {
        authorizationMethod: 'header',
    },
};
const oauth2 = new simple_oauth2_1.AuthorizationCode(whoopOauthConfig);
const REDIRECT_URI = process.env.WHOOP_REDIRECT_URI || 'http://localhost:4000/api/auth/whoop/callback';
function getWhoopAuthUrl(state) {
    const authorizationUri = oauth2.authorizeURL({
        redirect_uri: REDIRECT_URI,
        scope: [
            'read:recovery',
            'read:cycles',
            'read:workout',
            'read:sleep',
            'read:profile',
            'read:body_measurement',
            'offline',
        ].join(' '),
        state: state,
    });
    return authorizationUri;
}
async function handleWhoopCallback(code, userId) {
    try {
        // Exchange code for tokens
        const tokenResponse = await axios_1.default.post(whoopOauthConfig.auth.tokenHost + whoopOauthConfig.auth.tokenPath, new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: process.env.WHOOP_CLIENT_ID,
            client_secret: process.env.WHOOP_CLIENT_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        if (!access_token || !refresh_token) {
            throw new Error('Failed to obtain access token or refresh token from Whoop.');
        }
        // Store tokens in database
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                whoopAccessToken: access_token,
                whoopRefreshToken: refresh_token,
                whoopTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            },
        });
        // Fetch and store Whoop User ID
        const profileResponse = await axios_1.default.get('https://api.prod.whoop.com/developer/v2/user/profile/basic', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        if (profileResponse.data.user_id) {
            await database_1.default.user.update({
                where: { id: userId },
                data: { whoopUserId: profileResponse.data.user_id.toString() }
            });
        }
    }
    catch (error) {
        console.error('Error in handleWhoopCallback:', error);
        throw new Error('Failed to handle Whoop callback and obtain token.');
    }
}
class WhoopAPI {
    constructor() {
        this.baseURL = 'https://api.prod.whoop.com';
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }
    isTokenValid() {
        return !!(this.accessToken &&
            this.tokenExpiry &&
            Date.now() < this.tokenExpiry);
    }
    setTokens(accessToken, refreshToken, tokenExpiry) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
    }
    getTokens() {
        if (!this.accessToken || !this.refreshToken || !this.tokenExpiry) {
            return null;
        }
        return {
            access_token: this.accessToken,
            refresh_token: this.refreshToken,
            expires_in: Math.floor((this.tokenExpiry - Date.now()) / 1000)
        };
    }
    async makeAuthenticatedRequest(endpoint, params) {
        if (!this.accessToken || !this.isTokenValid()) {
            throw new Error('No valid authentication token available.');
        }
        try {
            const response = await axios_1.default.get(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                params,
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please reconnect your WHOOP account.');
            }
            throw error;
        }
    }
    /**
     * Initialize the WHOOP API connection with authorization code
     * @param authorizationCode The authorization code from WHOOP OAuth flow
     */
    async initialize(authorizationCode) {
        try {
            const formData = new URLSearchParams();
            formData.append('grant_type', 'authorization_code');
            formData.append('code', authorizationCode);
            formData.append('client_id', process.env.WHOOP_CLIENT_ID || '');
            formData.append('client_secret', process.env.WHOOP_CLIENT_SECRET || '');
            formData.append('redirect_uri', process.env.WHOOP_REDIRECT_URI || 'http://localhost:5173/whoop-callback');
            console.log('WHOOP token request data:', {
                grant_type: 'authorization_code',
                code: authorizationCode,
                client_id: process.env.WHOOP_CLIENT_ID,
                client_secret: process.env.WHOOP_CLIENT_SECRET ? '[REDACTED]' : 'NOT_SET',
                redirect_uri: process.env.WHOOP_REDIRECT_URI || 'http://localhost:5173/whoop-callback'
            });
            const response = await axios_1.default.post('https://api.prod.whoop.com/oauth/oauth2/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.accessToken = response.data.access_token;
            this.refreshToken = response.data.refresh_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        }
        catch (error) {
            console.error('Failed to initialize WHOOP API:', error);
            throw error;
        }
    }
    /**
     * Get sleep data for a specific cycle
     * @param cycleId The cycle ID
     * @returns Sleep data for the cycle
     */
    async getSleepDataForCycle(cycleId) {
        try {
            return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
        }
        catch (error) {
            console.error('Failed to fetch WHOOP sleep data for cycle:', error);
            throw error;
        }
    }
    /**
     * Get physical activity/workout data for a specific cycle
     * @param cycleId The cycle ID
     * @returns Physical activity data for the cycle
     */
    async getPhysicalDataForCycle(cycleId) {
        try {
            return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/workout`);
        }
        catch (error) {
            console.error('Failed to fetch WHOOP physical data for cycle:', error);
            throw error;
        }
    }
    /**
     * Get recovery data for a specific cycle
     * @param cycleId The cycle ID
     * @returns Recovery data for the cycle
     */
    async getRecoveryDataForCycle(cycleId) {
        try {
            return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
        }
        catch (error) {
            console.error('Failed to fetch WHOOP recovery data for cycle:', error);
            throw error;
        }
    }
    /**
     * Get sleep data for a specific date range
     * @param startDate Start date in ISO format (YYYY-MM-DD)
     * @param endDate End date in ISO format (YYYY-MM-DD)
     * @returns Array of sleep data
     */
    async getSleepData(startDate, endDate) {
        try {
            // First get the cycle data for the date range
            const cycles = await this.getCyclesInDateRange(startDate, endDate);
            if (!cycles || cycles.length === 0) {
                console.log('WHOOP API: No cycles found for date range:', startDate, 'to', endDate);
                return [];
            }
            // Then get sleep data for each cycle
            const sleepDataPromises = cycles.map(cycle => this.getSleepDataForCycle(cycle.id).catch(error => {
                console.warn(`Failed to fetch sleep data for cycle ${cycle.id}:`, error);
                return null;
            }));
            const sleepData = await Promise.all(sleepDataPromises);
            return sleepData.filter(data => data !== null);
        }
        catch (error) {
            console.error('Failed to fetch WHOOP sleep data:', error);
            throw error;
        }
    }
    /**
     * Get all cycles for a specific date range.
     * @returns An array of cycle data objects, or an empty array if none found.
     */
    async getCyclesInDateRange(startDate, endDate) {
        console.log(`[DEBUG getCyclesInDateRange] Input dates: start=${startDate}, end=${endDate}`);
        try {
            // First try without date parameters to see if user has ANY cycles
            console.log(`[DEBUG] Step 1: Checking if user has any cycles at all...`);
            const responseAll = await this.makeAuthenticatedRequest('/developer/v2/cycle', { limit: 25 });
            console.log(`[DEBUG] All cycles response:`, responseAll);
            if (responseAll && responseAll.records && Array.isArray(responseAll.records)) {
                console.log(`[DEBUG] User has ${responseAll.records.length} total cycles available`);
                if (responseAll.records.length === 0) {
                    console.log(`[DEBUG] User has no cycles at all`);
                    return [];
                }
                // Show some sample cycle dates for debugging
                const sampleCycles = responseAll.records.slice(0, 3).map((c) => ({
                    id: c.id,
                    start: c.start,
                    end: c.end
                }));
                console.log(`[DEBUG] Sample cycles:`, sampleCycles);
                // Now try with date filters using proper ISO 8601 format
                console.log(`[DEBUG] Step 2: Trying with date filters...`);
                let startDateTime = startDate;
                let endDateTime = endDate;
                // Only append if not already a full ISO string
                if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
                    startDateTime = `${startDate}T00:00:00.000Z`;
                }
                if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                    endDateTime = `${endDate}T23:59:59.999Z`;
                }
                console.log(`[DEBUG] Using ISO date-time format: start=${startDateTime}, end=${endDateTime}`);
                const response = await this.makeAuthenticatedRequest('/developer/v2/cycle', {
                    start: startDateTime,
                    end: endDateTime,
                    limit: 25
                });
                console.log(`[DEBUG] Filtered response:`, response);
                if (response && response.records && Array.isArray(response.records)) {
                    console.log(`[DEBUG] Found ${response.records.length} cycles in specified date range`);
                    return response.records;
                }
                console.log(`[DEBUG] No cycles found in specified date range, but user has cycles overall`);
                return [];
            }
            else {
                console.log(`[DEBUG] Unexpected response format for all cycles:`, responseAll);
                return [];
            }
        }
        catch (error) {
            console.log(`[DEBUG getCyclesInDateRange] Error caught:`, {
                isAxiosError: error.isAxiosError,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.isAxiosError && error.response?.status === 404) {
                console.log(`WHOOP API returned 404 - this might mean the user has no cycles or the endpoint is not available.`);
                return [];
            }
            console.error(`Failed to fetch WHOOP cycle data:`, error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Get sleep data for a specific cycle.
     * @param cycleId The ID of the cycle.
     * @returns A sleep data object, or null if not found.
     */
    async getSleepForCycle(cycleId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
            return response;
        }
        catch (error) {
            if (error.isAxiosError && error.response?.status === 404) {
                console.log(`No WHOOP sleep data found for cycle ${cycleId} (404).`);
                return null;
            }
            console.error(`Failed to fetch WHOOP sleep data for cycle ${cycleId}:`, error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Get recovery data for a specific cycle.
     * @param cycleId The ID of the cycle.
     * @returns A recovery data object, or null if not found.
     */
    async getRecoveryForCycle(cycleId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
            return response;
        }
        catch (error) {
            if (error.isAxiosError && error.response?.status === 404) {
                console.log(`No WHOOP recovery data found for cycle ${cycleId} (404).`);
                return null;
            }
            console.error(`Failed to fetch WHOOP recovery data for cycle ${cycleId}:`, error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Get all workouts for a specific date.
     * @returns An array of workout data objects, or an empty array if none found.
     */
    async getWorkoutsInDateRange(startDate, endDate) {
        try {
            const response = await this.makeAuthenticatedRequest('/developer/v2/activity/workout', { start: startDate, end: endDate });
            return response.records || [];
        }
        catch (error) {
            if (error.isAxiosError && error.response?.status === 404) {
                console.log(`No WHOOP workout data found for date range: ${startDate} to ${endDate} (404).`);
                return [];
            }
            console.error(`Failed to fetch WHOOP workout data for date range:`, error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Get user profile information from WHOOP
     * @returns User profile data
     */
    async getUserProfile() {
        try {
            return await this.makeAuthenticatedRequest('/developer/v2/user/profile/basic');
        }
        catch (error) {
            console.error('Failed to fetch WHOOP user profile:', error);
            throw error;
        }
    }
    /**
     * Check if the API connection is authenticated
     * @returns True if authenticated, false otherwise
     */
    isAuthenticated() {
        return this.accessToken !== null && this.isTokenValid();
    }
    /**
     * Get the current access token
     * @returns Access token or null if not available
     */
    getAccessToken() {
        return this.accessToken;
    }
    /**
     * Get the current refresh token
     * @returns Refresh token or null if not available
     */
    getRefreshToken() {
        return this.refreshToken;
    }
    /**
     * Get the token expiry timestamp
     * @returns Token expiry timestamp or null if not available
     */
    getTokenExpiry() {
        return this.tokenExpiry;
    }
    /**
     * Get sleep data by sleepId
     * @param sleepId The sleep ID
     * @returns Sleep data for the given sleepId
     */
    async getSleepById(sleepId) {
        try {
            return await this.makeAuthenticatedRequest(`/developer/v2/activity/sleep/${sleepId}`);
        }
        catch (error) {
            if (error.isAxiosError && error.response?.status === 404) {
                console.log(`No WHOOP sleep data found for sleepId ${sleepId} (404).`);
                return null;
            }
            console.error(`Failed to fetch WHOOP sleep data for sleepId ${sleepId}:`, error.response?.data || error.message);
            throw error;
        }
    }
}
exports.WhoopAPI = WhoopAPI;
exports.whoopAPI = new WhoopAPI();
exports.default = WhoopAPI;
