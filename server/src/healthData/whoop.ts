import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

  private isTokenValid(): boolean {
    return this.tokenExpiry ? Date.now() < this.tokenExpiry : false;
  }

  private async refreshAccessToken(): Promise<void> {
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
      console.error('Failed to refresh WHOOP access token:', error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, params?: any): Promise<any> {
    if (!this.accessToken || !this.isTokenValid()) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
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

    const response = await axios.get(`${this.baseURL}${endpoint}`, config);
    return response.data;
  }

  /**
   * Initialize the WHOOP API connection with authorization code
   * @param authorizationCode The authorization code from WHOOP OAuth flow
   */
  async initialize(authorizationCode: string): Promise<void> {
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
   * Get sleep data for a specific date range
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Array of sleep data
   */
  async getSleepData(startDate: string, endDate: string): Promise<WhoopSleepData[]> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/sleep', {
        start: startDate,
        end: endDate,
      });
    } catch (error) {
      console.error('Failed to fetch WHOOP sleep data:', error);
      throw error;
    }
  }

  /**
   * Get sleep data for the most recent sleep cycle
   * @returns Latest sleep data
   */
  async getLatestSleepData(): Promise<WhoopSleepData | null> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/sleep/latest');
    } catch (error) {
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
  async getPhysicalData(startDate: string, endDate: string): Promise<WhoopPhysicalData[]> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/workout', {
        start: startDate,
        end: endDate,
      });
    } catch (error) {
      console.error('Failed to fetch WHOOP physical data:', error);
      throw error;
    }
  }

  /**
   * Get the most recent physical activity/workout data
   * @returns Latest physical activity data
   */
  async getLatestPhysicalData(): Promise<WhoopPhysicalData | null> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/workout/latest');
    } catch (error) {
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
  async getRecoveryData(startDate: string, endDate: string): Promise<any[]> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/recovery', {
        start: startDate,
        end: endDate,
      });
    } catch (error) {
      console.error('Failed to fetch WHOOP recovery data:', error);
      throw error;
    }
  }

  /**
   * Get the most recent recovery data
   * @returns Latest recovery data
   */
  async getLatestRecoveryData(): Promise<any | null> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/cycle/recovery/latest');
    } catch (error) {
      console.error('Failed to fetch latest WHOOP recovery data:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   * @returns User profile data
   */
  async getUserProfile(): Promise<any> {
    try {
      return await this.makeAuthenticatedRequest('/developer/v1/user/profile');
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
}

// Export a singleton instance
export const whoopAPI = new WhoopAPI();
export default WhoopAPI;
