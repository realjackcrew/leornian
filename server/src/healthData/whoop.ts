import prisma from '../db/database';
import { AuthorizationCode } from 'simple-oauth2';
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
const oauth2 = new AuthorizationCode(whoopOauthConfig);
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
interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
interface WhoopProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
}
export async function handleWhoopCallback(code: string, userId: string): Promise<void> {
  try {
    const tokenResponse = await fetch(whoopOauthConfig.auth.tokenHost + whoopOauthConfig.auth.tokenPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!
      })
    });
    if (!tokenResponse.ok) {
      throw new Error(`Failed to obtain tokens: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }
    const tokenData: WhoopTokenResponse = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    if (!access_token || !refresh_token) {
      throw new Error('Failed to obtain access token or refresh token from Whoop.');
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        whoopAccessToken: access_token,
        whoopRefreshToken: refresh_token,
        whoopTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
    });
    const profileResponse = await fetch('https://api.prod.whoop.com/developer/v2/user/profile/basic',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch profile: ${profileResponse.status} ${profileResponse.statusText}`);
    }
    const profileData: WhoopProfile = await profileResponse.json();
    if (profileData.user_id) {
      await prisma.user.update({
        where: { id: userId },
        data: { whoopUserId: profileData.user_id.toString() }
      });
    }
  } catch (error) {
    console.error('Error in handleWhoopCallback:', error);
    throw new Error('Failed to handle Whoop callback and obtain token.');
  }
}
export class WhoopAPI {
  private baseURL = 'https://api.prod.whoop.com';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private isTokenValid(): boolean {
    return !!(
      this.accessToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    );
  }
  setTokens(accessToken: string, refreshToken: string, tokenExpiry: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = tokenExpiry;
  }
  getTokens(): { access_token: string; refresh_token: string; expires_in: number } | null {
    if (!this.accessToken || !this.refreshToken || !this.tokenExpiry) {
      return null;
    }
    return {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_in: Math.floor((this.tokenExpiry - Date.now()) / 1000)
    };
  }
  async makeAuthenticatedRequest<T = any>(endpoint: string, params?: any): Promise<T> {
    if (!this.accessToken || !this.isTokenValid()) {
      throw new Error('No valid authentication token available.');
    }
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      if (params) {
        Object.keys(params).forEach(key => {
          url.searchParams.append(key, params[key]);
        });
      }
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please reconnect your WHOOP account.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('Authentication failed')) {
        throw error;
      }
      throw error;
    }
  }
  async initialize(authorizationCode: string): Promise<void> {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', authorizationCode);
      formData.append('client_id', process.env.WHOOP_CLIENT_ID || '');
      formData.append('client_secret', process.env.WHOOP_CLIENT_SECRET || '');
      formData.append('redirect_uri', process.env.WHOOP_REDIRECT_URI || 'http://localhost:5173/whoop-callback');
      const response = await fetch(
        'https://api.prod.whoop.com/oauth/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to initialize WHOOP API: ${response.status} ${response.statusText}`);
      }
      const responseData: WhoopTokenResponse = await response.json();
      this.accessToken = responseData.access_token;
      this.refreshToken = responseData.refresh_token;
      this.tokenExpiry = Date.now() + (responseData.expires_in * 1000);
    } catch (error) {
      console.error('Failed to initialize WHOOP API:', error);
      throw error;
    }
  }
  async getSleepDataForCycle(cycleId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
    } catch (error) {
      console.error('Failed to fetch WHOOP sleep data for cycle:', error);
      throw error;
    }
  }
  async getPhysicalDataForCycle(cycleId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/workout`);
    } catch (error) {
      console.error('Failed to fetch WHOOP physical data for cycle:', error);
      throw error;
    }
  }
  async getRecoveryDataForCycle(cycleId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
    } catch (error) {
      console.error('Failed to fetch WHOOP recovery data for cycle:', error);
      throw error;
    }
  }
  async getSleepData(startDate: string, endDate: string): Promise<any[]> {
    try {
      const cycles = await this.getCyclesInDateRange(startDate, endDate);
      if (!cycles || cycles.length === 0) {
        return [];
      }
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
  async getCyclesInDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      const responseAll = await this.makeAuthenticatedRequest('/developer/v2/cycle', { limit: 25 });
      if (responseAll && responseAll.records && Array.isArray(responseAll.records)) {
        if (responseAll.records.length === 0) {
          return [];
        }
        let startDateTime = startDate;
        let endDateTime = endDate;
        if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
          startDateTime = `${startDate}T00:00:00.000Z`;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          endDateTime = `${endDate}T23:59:59.999Z`;
        }
        const response = await this.makeAuthenticatedRequest('/developer/v2/cycle', { 
          start: startDateTime, 
          end: endDateTime,
          limit: 25 
        });
        if (response && response.records && Array.isArray(response.records)) {
          return response.records;
        }
        return [];
      } else {
        return [];
      }
    } catch (error: any) {
      if (error.message && error.message.includes('404')) {
        return [];
      }
      console.error(`Failed to fetch WHOOP cycle data:`, error.message);
      throw error;
    }
  }
  async getSleepForCycle(cycleId: string): Promise<any | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/sleep`);
      return response;
    } catch (error: any) {
      if (error.message && error.message.includes('404')) {
        return null;
      }
      console.error(`Failed to fetch WHOOP sleep data for cycle ${cycleId}:`, error.message);
      throw error;
    }
  }
  async getRecoveryForCycle(cycleId: string): Promise<any | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/developer/v2/cycle/${cycleId}/recovery`);
      return response;
    } catch (error: any) {
      if (error.message && error.message.includes('404')) {
        return null;
      }
      console.error(`Failed to fetch WHOOP recovery data for cycle ${cycleId}:`, error.message);
      throw error;
    }
  }
  async getWorkoutsInDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest('/developer/v2/activity/workout', { start: startDate, end: endDate });
      return response.records || [];
    } catch (error: any) {
      if (error.message && error.message.includes('404')) {
        return [];
      }
      console.error(`Failed to fetch WHOOP workout data for date range:`, error.message);
      throw error;
    }
  }
  async getUserProfile(): Promise<any> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v2/user/profile/basic');
    } catch (error) {
      console.error('Failed to fetch WHOOP user profile:', error);
      throw error;
    }
  }
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.isTokenValid();
  }
  getAccessToken(): string | null {
    return this.accessToken;
  }
  getRefreshToken(): string | null {
    return this.refreshToken;
  }
  getTokenExpiry(): number | null {
    return this.tokenExpiry;
  }
  async getSleepById(sleepId: string): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest(`/developer/v2/activity/sleep/${sleepId}`);
    } catch (error: any) {
      if (error.message && error.message.includes('404')) {
        return null;
      }
      console.error(`Failed to fetch WHOOP sleep data for sleepId ${sleepId}:`, error.message);
      throw error;
    }
  }
}
export const whoopAPI = new WhoopAPI();
export default WhoopAPI;
