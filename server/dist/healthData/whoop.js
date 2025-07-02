"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoopAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class WhoopAPI {
    constructor() {
        this.baseURL = 'https://api.prod.whoop.com';
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }
    isTokenValid() {
        return this.tokenExpiry ? Date.now() < this.tokenExpiry : false;
    }
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        try {
            // WHOOP expects form-urlencoded data, not JSON
            const formData = new URLSearchParams();
            formData.append('grant_type', 'refresh_token');
            formData.append('refresh_token', this.refreshToken);
            formData.append('client_id', process.env.WHOOP_CLIENT_ID || '');
            formData.append('client_secret', process.env.WHOOP_CLIENT_SECRET || '');
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
            console.error('Failed to refresh WHOOP access token:', error);
            throw error;
        }
    }
    async makeAuthenticatedRequest(endpoint, params) {
        if (!this.accessToken || !this.isTokenValid()) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            }
            else {
                throw new Error('No valid authentication token available');
            }
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            params,
        };
        const response = await axios_1.default.get(`${this.baseURL}${endpoint}`, config);
        return response.data;
    }
    /**
     * Initialize the WHOOP API connection with authorization code
     * @param authorizationCode The authorization code from WHOOP OAuth flow
     */
    async initialize(authorizationCode) {
        try {
            // WHOOP expects form-urlencoded data, not JSON
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
     * Get sleep data for a specific date range
     * @param startDate Start date in ISO format (YYYY-MM-DD)
     * @param endDate End date in ISO format (YYYY-MM-DD)
     * @returns Array of sleep data
     */
    async getSleepData(startDate, endDate) {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/sleep', {
                start: startDate,
                end: endDate,
            });
        }
        catch (error) {
            console.error('Failed to fetch WHOOP sleep data:', error);
            throw error;
        }
    }
    /**
     * Get sleep data for the most recent sleep cycle
     * @returns Latest sleep data
     */
    async getLatestSleepData() {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/sleep/latest');
        }
        catch (error) {
            console.error('Failed to fetch latest WHOOP sleep data:', error);
            throw error;
        }
    }
    /**
     * Get physical activity/workout data for a specific date range
     * @param startDate Start date in ISO format (YYYY-MM-DD)
     * @param endDate End date in ISO format (YYYY-MM-DD)
     * @returns Array of physical activity data
     */
    async getPhysicalData(startDate, endDate) {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/workout', {
                start: startDate,
                end: endDate,
            });
        }
        catch (error) {
            console.error('Failed to fetch WHOOP physical data:', error);
            throw error;
        }
    }
    /**
     * Get the most recent physical activity/workout data
     * @returns Latest physical activity data
     */
    async getLatestPhysicalData() {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/workout/latest');
        }
        catch (error) {
            console.error('Failed to fetch latest WHOOP physical data:', error);
            throw error;
        }
    }
    /**
     * Get recovery data for a specific date range
     * @param startDate Start date in ISO format (YYYY-MM-DD)
     * @param endDate End date in ISO format (YYYY-MM-DD)
     * @returns Array of recovery data
     */
    async getRecoveryData(startDate, endDate) {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/recovery', {
                start: startDate,
                end: endDate,
            });
        }
        catch (error) {
            console.error('Failed to fetch WHOOP recovery data:', error);
            throw error;
        }
    }
    /**
     * Get the most recent recovery data
     * @returns Latest recovery data
     */
    async getLatestRecoveryData() {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/cycle/recovery/latest');
        }
        catch (error) {
            console.error('Failed to fetch latest WHOOP recovery data:', error);
            throw error;
        }
    }
    /**
     * Get user profile information
     * @returns User profile data
     */
    async getUserProfile() {
        try {
            return await this.makeAuthenticatedRequest('/developer/v1/user/profile');
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
}
// Export a singleton instance
exports.whoopAPI = new WhoopAPI();
exports.default = WhoopAPI;
