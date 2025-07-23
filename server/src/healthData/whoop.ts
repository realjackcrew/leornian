import axios from 'axios';
import simpleOAuth2, { AccessToken, Token } from 'simple-oauth2';
import prisma from '../db/database';


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
    authorizationMethod: 'header' as const,
  },
};

const oauth2 = new simpleOAuth2.AuthorizationCode(whoopOauthConfig);

const REDIRECT_URI = process.env.WHOOP_REDIRECT_URI || 'http://localhost:4000/api/auth/whoop/callback';

export function getWhoopAuthUrl(state: string): string {
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

export async function handleWhoopCallback(code: string, userId: string): Promise<void> {
  try {
    const result = await oauth2.getToken({
      code,
      redirect_uri: REDIRECT_URI,
    });

    const accessToken = oauth2.createToken(result as unknown as Token);

    const { token } = accessToken;

    if (!token.access_token || !token.refresh_token) {
      throw new Error('Failed to obtain access token or refresh token from Whoop.');
    }

    // Since credentials are on the User model, we update the user directly.
    await prisma.user.update({
      where: { id: userId },
      data: {
        whoopAccessToken: token.access_token,
        whoopRefreshToken: token.refresh_token,
        whoopTokenExpiresAt: new Date(Date.now() + (token.expires_in as number) * 1000),
      },
    });

    // Fetch and store the Whoop User ID
    const profile = await makeAuthenticatedRequest(userId, { method: 'GET', url: 'https://api.prod.whoop.com/developer/v2/user/profile/basic' });
    if (profile.user_id) {
        await prisma.user.update({
            where: { id: userId },
            data: { whoopUserId: profile.user_id.toString() },
        });
    }

  } catch (error) {
    console.error('Error in handleWhoopCallback:', error);
    throw new Error('Failed to handle Whoop callback and obtain token.');
  }
}

async function refreshWhoopToken(userId: string): Promise<AccessToken> {
    console.log('[Whoop] Access token expired or invalid. Attempting to refresh.');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.whoopRefreshToken) {
        throw new Error('No refresh token found for user. Please reconnect Whoop account.');
    }

    try {
        console.log('[Whoop] Preparing to refresh token. Parameters:');
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', user.whoopRefreshToken);
        params.append('client_id', whoopOauthConfig.client.id);
        params.append('client_secret', whoopOauthConfig.client.secret);
        params.append('scope', 'offline');
        
        console.log({
            grant_type: 'refresh_token',
            refresh_token: 'REDACTED',
            client_id: whoopOauthConfig.client.id,
            client_secret: 'REDACTED',
            scope: 'offline'
        });

        const refreshResponse = await axios.post(
            whoopOauthConfig.auth.tokenHost + whoopOauthConfig.auth.tokenPath,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const newAccessTokenData = refreshResponse.data;
        const newAccessToken = oauth2.createToken(newAccessTokenData as unknown as Token);

        await prisma.user.update({
            where: { id: userId },
            data: {
                whoopAccessToken: newAccessToken.token.access_token as string,
                whoopRefreshToken: newAccessToken.token.refresh_token as string,
                whoopTokenExpiresAt: new Date(newAccessToken.token.expires_at as number),
            },
        });
        console.log('[Whoop] Successfully refreshed token.');
        return newAccessToken;
    } catch (error: any) {
        console.error('[Whoop] Full error during token refresh:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            const errorMessage = (error.response.data?.error_description || error.response.data?.error || JSON.stringify(error.response.data));
            throw new Error(`Token refresh failed with status ${error.response.status}: ${errorMessage}`);
        } else {
            console.error(error.message);
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
}

async function getAccessToken(userId: string): Promise<AccessToken> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
    throw new Error('No Whoop credentials found for this user.');
  }

  let accessToken = oauth2.createToken({
    access_token: user.whoopAccessToken,
    refresh_token: user.whoopRefreshToken,
    expires_at: user.whoopTokenExpiresAt.getTime(),
  } as Token);

  if (accessToken.expired()) {
    console.log('[Whoop] Token has expired. Calling refresh function.');
    return await refreshWhoopToken(userId);
  }

  console.log('[Whoop] Token is valid and not expired.');
  return accessToken;
}


export async function makeAuthenticatedRequest(userId: string, options: any): Promise<any> {
    let accessToken = await getAccessToken(userId);

    const doRequest = async (token: AccessToken) => {
        const requestConfig = {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token.token.access_token}`,
            },
        };
        console.log(`[Whoop] Making authenticated request to: ${options.url}`);
        return axios(requestConfig);
    };

    try {
        const response = await doRequest(accessToken);
        console.log(`[Whoop] Request to ${options.url} successful.`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            console.log('[Whoop] Initial request failed with 401. Attempting token refresh and retry.');
            try {
                const newAccessToken = await refreshWhoopToken(userId);
                const retryResponse = await doRequest(newAccessToken);
                console.log('[Whoop] Retry request successful.');
                return retryResponse.data;
            } catch (retryError: any) {
                console.error(`[Whoop] Request failed even after token refresh.`);
                throw new Error(`Whoop request failed after retry: ${retryError.message}`);
            }
        }
        console.error(`[Whoop] Non-401 error during authenticated request to ${options.url}:`, error.message);
        throw new Error(`Whoop request failed: ${error.message}`);
    }
}

interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface WhoopSleepData {
  id: string;
  start: string;
  end: string;
  score: {
    recovery_score: number;
    sleep_performance_score: number;
    sleep_consistency_score: number;
  };
  sleep: {
    sleep_need_baseline: number;
    sleep_debt: number;
    sleep_efficiency: number;
    sleep_latency: number;
    sleep_onset: string;
    sleep_quality: number;
    sleep_quality_score: number;
    sleep_rem: number;
    sleep_requirement: number;
    sleep_slow_wave: number;
    sleep_time_in_bed: number;
    sleep_time_sleep: number;
    sleep_wake: string;
  };
}

interface WhoopPhysicalData {
  id: string;
  start: string;
  end: string;
  score: {
    strain_score: number;
    cardiovascular_strain: number;
    muscular_strain: number;
  };
  workout: {
    workout_id: string;
    sport_id: number;
    sport_name: string;
    workout_start: string;
    workout_end: string;
    duration: number;
    distance: number;
    calories: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

class WhoopAPI {
  private baseURL = 'https://api.prod.whoop.com';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  // Scopes requested when redirecting to WHOOP
  private scopes = ['offline', 'read:profile', 'read:cycles', 'read:recovery', 'read:sleep', 'read:workout'];

  private isTokenValid(): boolean {
    return this.tokenExpiry ? Date.now() < this.tokenExpiry : false;
  }

  public async refreshAccessToken(): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', this.refreshToken);
      formData.append('client_id', process.env.WHOOP_CLIENT_ID || '');
      formData.append('client_secret', process.env.WHOOP_CLIENT_SECRET || '');
      formData.append('redirect_uri', REDIRECT_URI); // <-- Add this line

      const response = await axios.post<WhoopTokenResponse>(
        'https://api.prod.whoop.com/oauth/oauth2/token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('Failed to refresh WHOOP access token:', error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, params?: any): Promise<any> {
    console.log(`[WHOOP API] Making request to: ${endpoint}`, params ? `with params: ${JSON.stringify(params)}` : '');
    
    if (!this.accessToken || !this.isTokenValid()) {
      if (this.refreshToken) {
        console.log('[WHOOP API] Token is expired or invalid, attempting refresh before request.');
        await this.refreshAccessToken();
      } else {
        throw new Error('No valid authentication token or refresh token available.');
      }
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      params,
    };

    try {
      console.log(`[WHOOP API] Sending request to: ${this.baseURL}${endpoint}`);
      console.log(`[WHOOP API] Request config:`, { 
        url: `${this.baseURL}${endpoint}`,
        headers: { ...config.headers, Authorization: `Bearer ${this.accessToken?.substring(0, 10)}...` },
        params: config.params 
      });
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, config);
      
      console.log(`[WHOOP API] Request successful for ${endpoint}`);
      console.log(`[WHOOP API] Response status:`, response.status);
      console.log(`[WHOOP API] Response headers:`, response.headers);
      console.log(`[WHOOP API] Response data type:`, typeof response.data);
      console.log(`[WHOOP API] Response data:`, JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      // If the request fails with a 401, try to refresh it and retry the request once.
      if (error.isAxiosError && error.response?.status === 401) {
        console.log('[WHOOP API] Request failed with 401. Attempting token refresh...');
        if (this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the request with the new token.
            console.log('[WHOOP API] Token refreshed successfully. Retrying original request...');
            const retryConfig = { ...config, headers: { ...config.headers, Authorization: `Bearer ${this.accessToken}` } };
            const response = await axios.get(`${this.baseURL}${endpoint}`, retryConfig);
            console.log(`[WHOOP API] Retry request successful for ${endpoint}`);
            return response.data;
          } catch (refreshError) {
            console.error('[WHOOP API] Failed to refresh token after a 401 error:', refreshError);
            throw new Error('Authorization failed. Could not refresh token. Please reconnect your WHOOP account.');
          }
        } else {
          throw new Error('Authorization failed. No refresh token available.');
        }
      }
      // For other errors, just re-throw.
      console.error(`[WHOOP API] Request failed for endpoint ${endpoint}:`, error.response?.status, error.response?.data || error.message);
      console.error(`[WHOOP API] Full error:`, error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : error.message);
      throw error;
    }
  }

  /**
   * Initialize the WHOOP API connection with authorization code
   * @param authorizationCode The authorization code from WHOOP OAuth flow
   */
  async initialize(authorizationCode: string): Promise<void> {
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

      const response = await axios.post<WhoopTokenResponse>(
        'https://api.prod.whoop.com/oauth/oauth2/token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    } catch (error) {
      console.error('Failed to initialize WHOOP API:', error);
      throw error;
    }
  }

  /**
   * Get sleep data for a specific cycle
   * @param cycleId The cycle ID
   * @returns Sleep data for the cycle
   */
  async getSleepDataForCycle(cycleId: string): Promise<WhoopSleepData | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
    } catch (error) {
      console.error('Failed to fetch WHOOP sleep data for cycle:', error);
      throw error;
    }
  }

  /**
   * Get physical activity/workout data for a specific cycle
   * @param cycleId The cycle ID
   * @returns Physical activity data for the cycle
   */
  async getPhysicalDataForCycle(cycleId: string): Promise<WhoopPhysicalData | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/workout`);
    } catch (error) {
      console.error('Failed to fetch WHOOP physical data for cycle:', error);
      throw error;
    }
  }

  /**
   * Get recovery data for a specific cycle
   * @param cycleId The cycle ID
   * @returns Recovery data for the cycle
   */
  async getRecoveryDataForCycle(cycleId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
    } catch (error) {
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
  async getSleepData(startDate: string, endDate: string): Promise<WhoopSleepData[]> {
    try {
      // First get the cycle data for the date range
      const cycles = await this.getCyclesInDateRange(startDate, endDate);
      
      if (!cycles || cycles.length === 0) {
        console.log('WHOOP API: No cycles found for date range:', startDate, 'to', endDate);
        return [];
      }
      
      // Then get sleep data for each cycle
      const sleepDataPromises = cycles.map(cycle => 
        this.getSleepDataForCycle(cycle.id).catch(error => {
          console.warn(`Failed to fetch sleep data for cycle ${cycle.id}:`, error);
          return null;
        })
      );
      
      const sleepData = await Promise.all(sleepDataPromises);
      return sleepData.filter(data => data !== null);
    } catch (error) {
      console.error('Failed to fetch WHOOP sleep data:', error);
      throw error;
    }
  }

  /**
   * Get all cycles for a specific date range.
   * @returns An array of cycle data objects, or an empty array if none found.
   */
  async getCyclesInDateRange(startDate: string, endDate: string): Promise<any[]> {
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
        const sampleCycles = responseAll.records.slice(0, 3).map((c: any) => ({
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
      } else {
        console.log(`[DEBUG] Unexpected response format for all cycles:`, responseAll);
        return [];
      }
    } catch (error: any) {
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
  async getSleepForCycle(cycleId: string): Promise<any | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
      return response;
    } catch (error: any) {
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
  async getRecoveryForCycle(cycleId: string): Promise<any | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
      return response;
    } catch (error: any) {
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
  async getWorkoutsInDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest('/developer/v2/activity/workout', { start: startDate, end: endDate });
      return response.records || [];
    } catch (error: any) {
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
  async getUserProfile(): Promise<any> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v2/user/profile/basic');
    } catch (error) {
      console.error('Failed to fetch WHOOP user profile:', error);
      throw error;
    }
  }

  /**
   * Check if the API connection is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.isTokenValid();
  }

  /**
   * Get the current access token
   * @returns Access token or null if not available
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get the current refresh token
   * @returns Refresh token or null if not available
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get the token expiry timestamp
   * @returns Token expiry timestamp or null if not available
   */
  getTokenExpiry(): number | null {
    return this.tokenExpiry;
  }

  /**
   * Set the access, refresh tokens, and expiry from user credentials
   * @param accessToken The access token
   * @param refreshToken The refresh token
   * @param tokenExpiry The expiry timestamp (ms since epoch)
   */
  setTokens(accessToken: string, refreshToken: string, tokenExpiry: number | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = tokenExpiry;
  }

  /**
   * Get current tokens as an object (for database storage)
   * @returns Object with access_token, refresh_token, and expires_in
   */
  getTokens(): { access_token: string; refresh_token: string; expires_in: number } | null {
    if (!this.accessToken || !this.refreshToken) {
      return null;
    }
    
    const expiresIn = this.tokenExpiry ? Math.floor((this.tokenExpiry - Date.now()) / 1000) : null;
    return {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_in: expiresIn || 0
    };
  }

  /**
   * Get sleep data by sleepId
   * @param sleepId The sleep ID
   * @returns Sleep data for the given sleepId
   */
  async getSleepById(sleepId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/activity/sleep/${sleepId}`);
    } catch (error: any) {
      if (error.isAxiosError && error.response?.status === 404) {
        console.log(`No WHOOP sleep data found for sleepId ${sleepId} (404).`);
        return null;
      }
      console.error(`Failed to fetch WHOOP sleep data for sleepId ${sleepId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

// Helper to get a recent date range for fetching latest data
const getRecentDateRange = () => {
  const now = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 2); // Covers today, yesterday, and the day before

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  return {
    start: formatDate(threeDaysAgo),
    end: formatDate(now)
  };
};

export const whoopAPI = new WhoopAPI();
export default WhoopAPI;
