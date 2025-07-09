import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/database';
import { whoopAPI } from '../healthData/whoop';

const router = Router();

// POST /whoop/auth - Handle WHOOP OAuth callback
router.post('/whoop/auth', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    await whoopAPI.initialize(authorizationCode);

    // Get the tokens from the WHOOP API instance
    const tokens = {
      access_token: whoopAPI.getAccessToken(),
      refresh_token: whoopAPI.getRefreshToken(),
      expires_in: whoopAPI.getTokenExpiry() ? Math.floor((whoopAPI.getTokenExpiry()! - Date.now()) / 1000) : null,
      token_type: 'Bearer'
    };

    console.log('WHOOP auth: Tokens received, storing in database');

    // Store the credentials in the database
    await prisma.user.update({
      where: { id: req.userId! },
      data: {
        whoopCredentials: tokens as any
      }
    });

    console.log('WHOOP auth: Credentials stored successfully for user:', req.userId);

    res.json({ 
      success: true, 
      message: 'WHOOP credentials stored successfully' 
    });
  } catch (error: any) {
    console.error('WHOOP authentication error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to authenticate with WHOOP';
    if (error.response?.data) {
      console.error('WHOOP API error details:', error.response.data);
      
      const whoopError = error.response.data;
      if (whoopError.error === 'invalid_grant') {
        if (whoopError.error_hint?.includes('already been used')) {
          errorMessage = 'This authorization code has already been used. Please try connecting WHOOP again.';
        } else {
          errorMessage = 'Authorization code is invalid or expired. Please try connecting WHOOP again.';
        }
      } else {
        errorMessage = `WHOOP API error: ${whoopError.error_description || whoopError.error || errorMessage}`;
      }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// GET /whoop/status - Check if user has WHOOP credentials
router.get('/whoop/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { whoopCredentials: true }
    });

    const hasCredentials = user?.whoopCredentials !== null;
    res.json({ 
      hasCredentials,
      isConnected: hasCredentials
    });
  } catch (error) {
    console.error('Error checking WHOOP status:', error);
    res.status(500).json({ error: 'Failed to check WHOOP status' });
  }
});

// DELETE /whoop/disconnect - Remove WHOOP credentials
router.delete('/whoop/disconnect', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.userId! },
      data: {
        whoopCredentials: undefined
      }
    });

    res.json({ 
      success: true, 
      message: 'WHOOP credentials removed successfully' 
    });
  } catch (error) {
    console.error('Error disconnecting WHOOP:', error);
    res.status(500).json({ error: 'Failed to disconnect WHOOP' });
  }
});

// GET /whoop/data - Fetch latest WHOOP data (only for today's log)
router.get('/whoop/data', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get user's WHOOP credentials
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { whoopCredentials: true }
    });
    if (!user?.whoopCredentials) {
      res.status(400).json({ error: 'No WHOOP credentials found for user' });
      return;
    }
    const { access_token, refresh_token, expires_in } = user.whoopCredentials as any;
    // expires_in is seconds remaining, but we want expiry timestamp
    const tokenExpiry = expires_in ? (Date.now() + expires_in * 1000) : null;
    whoopAPI.setTokens(access_token, refresh_token, tokenExpiry);

    let sleepData: any = null, physicalData: any = null, recoveryData: any = null;
    let tokensUpdated = false;

    try {
      console.log('WHOOP data fetch: Attempting to fetch latest data for user:', req.userId);
      
      // Try to fetch latest data with current tokens
      [sleepData, physicalData, recoveryData] = await Promise.all([
        whoopAPI.getLatestSleepData(),
        whoopAPI.getLatestPhysicalData(),
        whoopAPI.getLatestRecoveryData()
      ]);
      
      console.log('WHOOP data fetch: Successfully fetched latest data:', {
        hasSleep: !!sleepData,
        hasPhysical: !!physicalData,
        hasRecovery: !!recoveryData
      });
    } catch (apiError: any) {
      // If we get a 401, try to refresh tokens and retry
      if (apiError.response?.status === 401) {
        console.log('WHOOP API returned 401, attempting token refresh for user:', req.userId);
        try {
          const newTokens = await whoopAPI.refreshAccessToken();
          
          // Update the database with new tokens
          await prisma.user.update({
            where: { id: req.userId! },
            data: {
              whoopCredentials: {
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token,
                expires_in: newTokens.expires_in,
                token_type: 'Bearer'
              } as any
            }
          });
          
          console.log('WHOOP tokens refreshed and updated in database for user:', req.userId);
          tokensUpdated = true;

          // Retry the API calls with new tokens
          [sleepData, physicalData, recoveryData] = await Promise.all([
            whoopAPI.getLatestSleepData(),
            whoopAPI.getLatestPhysicalData(),
            whoopAPI.getLatestRecoveryData()
          ]);
        } catch (refreshError) {
          console.error('Failed to refresh WHOOP tokens for user:', req.userId, refreshError);
          res.status(401).json({ 
            error: 'WHOOP credentials have expired. Please go to Settings > Integrations to reconnect your WHOOP account.',
            code: 'WHOOP_TOKEN_EXPIRED'
          });
          return;
        }
      } else if (apiError.response?.status === 404) {
        // 404 means no latest data available, which is normal
        console.log('No latest WHOOP data available for user:', req.userId);
        sleepData = null;
        physicalData = null;
        recoveryData = null;
      } else {
        // Re-throw non-401/404 errors
        throw apiError;
      }
    }

    const sleep = sleepData;
    const physical = physicalData;
    const recovery = recoveryData;

    // If tokens were refreshed during the request, update database again
    if (!tokensUpdated) {
      const currentTokens = whoopAPI.getTokens();
      if (currentTokens && (currentTokens.access_token !== access_token || currentTokens.refresh_token !== refresh_token)) {
        await prisma.user.update({
          where: { id: req.userId! },
          data: {
            whoopCredentials: {
              access_token: currentTokens.access_token,
              refresh_token: currentTokens.refresh_token,
              expires_in: currentTokens.expires_in,
              token_type: 'Bearer'
            } as any
          }
        });
        console.log('WHOOP tokens updated in database after API calls for user:', req.userId);
      }
    }

    // Map WHOOP data to log fields
    const result: any = {};
    if (sleep) {
      result.bedtime = sleep.sleep.sleep_onset ? sleep.sleep.sleep_onset.substring(11, 16) : null; // 'HH:MM'
      result.wakeTime = sleep.sleep.sleep_wake ? sleep.sleep.sleep_wake.substring(11, 16) : null;
      result.sleepEfficiencyPercent = sleep.sleep.sleep_efficiency ? Math.round(sleep.sleep.sleep_efficiency * 100) : null;
      result.sleepFulfillmentPercent = sleep.sleep.sleep_quality_score ? Math.round(sleep.sleep.sleep_quality_score * 100) : null;
      result.sleepDebtMinutes = sleep.sleep.sleep_debt ? Math.round(sleep.sleep.sleep_debt) : null;
    }
    if (physical) {
      // Look for strength training and run by sport_name
      result.didStrengthTrainingWorkout = physical.workout.sport_name && physical.workout.sport_name.toLowerCase().includes('strength');
      result.wentForRun = physical.workout.sport_name && physical.workout.sport_name.toLowerCase().includes('run');
      result.caloriesBurned = physical.workout.calories ? Math.round(physical.workout.calories) : null;
    }
    if (recovery) {
      result.restingHR = recovery.resting_heart_rate || null;
      result.heartRateVariability = recovery.heart_rate_variability || null;
      result.whoopStrainScore = recovery.strain_score || null;
      result.whoopRecoveryScorePercent = recovery.recovery_score ? Math.round(recovery.recovery_score * 100) : null;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching WHOOP data for log:', error);
    res.status(500).json({ error: 'Failed to fetch WHOOP data' });
  }
});

export default router; 