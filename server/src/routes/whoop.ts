import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/database';
import { whoopAPI } from '../healthData/whoop';
import express from 'express';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// In a real app, you'd want to use express-session to store state,
// but to keep it simple, we'll pass the JWT token in the state parameter.
// This is not the most secure method, but it is simple.
// Note: passport-oauth2 may overwrite the state if `state: true` is set in the strategy options.
// We are explicitly not setting it.

const whoopCallbackUrl = process.env.WHOOP_REDIRECT_URI || process.env.WHOOP_CALLBACK_URL!;

const whoopStrategy = new OAuth2Strategy({
    authorizationURL: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenURL: 'https://api.prod.whoop.com/oauth/oauth2/token',
    clientID: process.env.WHOOP_CLIENT_ID!,
    clientSecret: process.env.WHOOP_CLIENT_SECRET!,
    callbackURL: whoopCallbackUrl,
    passReqToCallback: true,
    // WHOOP uses plural 'read:cycles' in OAuth docs. Using wrong scope throws invalid_scope error.
    scope: ['offline', 'read:profile', 'read:cycles', 'read:recovery', 'read:sleep', 'read:workout']
  },
  async (req: Request, accessToken: string, refreshToken: string, results: any, profile: any, done: (err: any, user?: any) => void) => {
    try {
        const state = req.query.state as string;
        if (!state) {
            return done(new Error('State parameter missing'));
        }

        let decoded: any;
        try {
            decoded = jwt.verify(state, JWT_SECRET);
        } catch (e) {
            return done(new Error('Invalid state token'));
        }

        const userId = decoded.userId;
        const whoopUserId = profile.user_id;

        // Persist tokens in DB and log the retrieved access token for visibility.
        console.log('\x1b[32m[WHOOP] Access token obtained: ' + accessToken + '\x1b[0m');

        await prisma.user.update({
            where: { id: userId },
            data: { 
                whoopAccessToken: accessToken,
                whoopRefreshToken: refreshToken,
                whoopTokenExpiresAt: new Date(Date.now() + results.expires_in * 1000),
                whoopUserId: String(whoopUserId),
                firstName: profile.first_name,
                lastName: profile.last_name,
            }
        });

        // The "user" passed to `done` is not directly used in the session-less flow,
        // but it's good practice to return the user profile.
        return done(null, profile);

    } catch (error) {
        return done(error);
    }
  }
);

whoopStrategy.userProfile = (accessToken, done) => {
    // Note: The 'userProfile' method in passport-oauth2 is a bit of a legacy pattern.
    // The profile fetched here is mainly used to extract the `whoopUserId` after the initial auth.
    // We use a separate /v2/user/profile/basic call in the /test-auth route for explicit checks.
    fetch('https://api.prod.whoop.com/developer/v2/user/profile/basic', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(res => {
        if (!res.ok) {
            // Log the error but don't fail the whole auth flow, as the tokens are the main goal.
            console.error(`WHOOP userProfile fetch failed with status: ${res.status}`);
            return res.text().then(text => {
                console.error(`WHOOP userProfile error body: ${text}`);
                // Return a basic object so the flow can continue to the callback handler.
                // The main callback handler will store the tokens regardless.
                return { user_id: 'unknown' };
            });
        }
        return res.json();
    })
    .then(profile => {
        done(null, profile);
    })
    .catch(err => {
        console.error('Error fetching WHOOP user profile during auth:', err);
        // Allow the auth flow to continue even if profile fetch fails.
        done(null, { user_id: 'unknown' });
    });
};

passport.use('whoop', whoopStrategy);

// This middleware is necessary to initialize Passport
router.use(passport.initialize());

const isProduction = process.env.NODE_ENV === 'production';
// In production, we expect CLIENT_URL to be set. For development, we default to localhost.
const clientUrl = isProduction ? process.env.CLIENT_URL : 'http://localhost:5173';


// Redirect to WHOOP for authentication
// The JWT of the logged-in user is passed as state
router.get('/auth/whoop', authenticateToken, (req: AuthenticatedRequest, res, next) => {
    const token = req.query.token as string;
    if (!token) {
        // This case should be handled by authenticateToken, but as a fallback.
        return res.status(401).send('Authentication token not found in query parameter.');
    }
    console.log(`[WHOOP Auth] Redirecting to WHOOP. Using callback URL: ${whoopCallbackUrl}`);
    passport.authenticate('whoop', { state: token, session: false })(req, res, next);
});

// Callback route for WHOOP to redirect to
router.get('/auth/whoop/callback',
    passport.authenticate('whoop', {
        // We redirect to the client, which can then show a success/failure message.
        failureRedirect: `${clientUrl}/settings?whoopAuth=failed`,
        session: false
    }),
    (req, res) => {
        // Successful authentication
        res.redirect(`${clientUrl}/settings?whoopAuth=success`);
    }
);

router.get('/whoop/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: { whoopAccessToken: true }
        });

        const hasCredentials = !!user?.whoopAccessToken;
        res.json({ 
            hasCredentials,
            isConnected: hasCredentials
        });
    } catch (error) {
        console.error('Error checking WHOOP status:', error);
        res.status(500).json({ error: 'Failed to check WHOOP status' });
    }
});
  
router.delete('/whoop/disconnect', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await prisma.user.update({
        where: { id: req.userId! },
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
    } catch (error) {
      console.error('Error disconnecting WHOOP:', error);
      res.status(500).json({ error: 'Failed to disconnect WHOOP' });
    }
});

router.get('/whoop/test-auth', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { 
            whoopAccessToken: true,
            whoopRefreshToken: true,
            whoopTokenExpiresAt: true,
        }
    });

    if (!user || !user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
        return res.status(400).json({ success: false, message: 'No WHOOP credentials found for user.' });
    }
    
    let { whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt } = user;
    
    // If token is expired or close to expiring, refresh it
    if (Date.now() >= whoopTokenExpiresAt.getTime() - 5 * 60 * 1000) { // 5 minutes buffer
        try {
            const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: whoopRefreshToken,
                    client_id: process.env.WHOOP_CLIENT_ID!,
                    client_secret: process.env.WHOOP_CLIENT_SECRET!,
                })
            });

            const newTokens = await response.json();
            
            if (!response.ok) {
                throw new Error(newTokens.error_description || 'Failed to refresh token');
            }

            whoopAccessToken = newTokens.access_token;
            whoopRefreshToken = newTokens.refresh_token;
            whoopTokenExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
            
            await prisma.user.update({
                where: { id: req.userId! },
                data: {
                    whoopAccessToken,
                    whoopRefreshToken,
                    whoopTokenExpiresAt,
                }
            });
        } catch (error) {
            console.error('Failed to refresh WHOOP token during auth test', error);
            return res.status(401).json({ success: false, message: 'Could not refresh WHOOP session. Please reconnect.' });
        }
    }
    
    // Use the (potentially new) accessToken to test data endpoints.
    const api = whoopAPI;
    api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());

    // Test with cycles endpoint instead of profile (which doesn't work in v2 yet)
    const testDate = new Date();
    const startDate = new Date(testDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    try {
      const cycles = await api.getCyclesInDateRange(
        startDate.toISOString().split('T')[0], 
        testDate.toISOString().split('T')[0]
      );
      
      // Connection successful if we can call the API without auth errors
      res.json({ 
        success: true, 
        message: `Successfully connected to WHOOP. Found ${cycles.length} cycles in recent data.`,
        dataAvailable: cycles.length > 0
      });
    } catch (dataError: any) {
      // If we get a 401/403, it's an auth issue. If we get 404 with no data, that's ok.
      if (dataError.response?.status === 401 || dataError.response?.status === 403) {
        return res.status(400).json({ success: false, message: 'WHOOP authentication failed. Please reconnect your account.' });
      } else {
        // Other errors (like 404 for no data) are not auth failures
        res.json({ 
          success: true, 
          message: 'Successfully connected to WHOOP (no recent data available).',
          dataAvailable: false
        });
      }
    }
    
  } catch (error) {
    console.error('Error during WHOOP auth test:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred during the connection test.' });
  }
});

router.get('/whoop/data', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        console.log('[WHOOP] Starting data fetch for user:', req.userId);
        
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: { 
                whoopAccessToken: true,
                whoopRefreshToken: true,
                whoopTokenExpiresAt: true,
            }
        });

        if (!user || !user.whoopAccessToken || !user.whoopRefreshToken || !user.whoopTokenExpiresAt) {
            console.log('[WHOOP] No credentials found for user:', req.userId);
            return res.status(400).json({ error: 'No WHOOP credentials found for user' });
        }
        
        let { whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt } = user;
        console.log('[WHOOP] Found credentials for user, setting up API...');
        
        // The WhoopAPI class now handles its own token refreshes internally.
        // We just need to set the initial tokens from the database.
        const api = whoopAPI;
        api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());

        const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
        console.log('[WHOOP] Fetching data for date:', date);
        
        // The log date from the client is a 'YYYY-MM-DD' string. We need to find the cycle that corresponds to this day.
        // A WHOOP cycle is defined by when a user goes to sleep and wakes up. The cycle for a given calendar day
        // is the one where the primary sleep *ends* on that day.
        const logDate = new Date(`${date}T12:00:00.000Z`); // Use noon to avoid timezone issues.
        const startDate = new Date(logDate);
        startDate.setDate(logDate.getDate() - 1); // Widen range to be safe.
        const endDate = new Date(logDate);
        endDate.setDate(logDate.getDate() + 1);

        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();
        console.log('[WHOOP] Searching for cycles between:', startISO, 'and', endISO);

        const cycles = await api.getCyclesInDateRange(startISO, endISO);
        console.log('[WHOOP] Found cycles:', cycles?.length || 0);
        
        if (!cycles || cycles.length === 0) {
            console.log('[WHOOP] No cycles found, returning empty data');
            return res.json({ success: true, data: {}, message: 'No WHOOP cycles found for this date range.' });
        }

        //find the cycle where the main sleep ends on the log date
        const targetCycle = cycles.find((c: any) => c.end && c.end.startsWith(date));
        if (!targetCycle) {
            console.log('[WHOOP] No target cycle found for date:', date);
            console.log('[WHOOP] Available cycles:', cycles.map((c: any) => ({ id: c.id, start: c.start, end: c.end })));
            return res.json({ success: true, data: {}, message: 'Could not find a matching WHOOP cycle for this date.' });
        }

        console.log('[WHOOP] Found target cycle:', targetCycle.id, 'with end date:', targetCycle.end);

        //fetch sleep, recovery, and workouts using cycle ID and date range
        console.log('[WHOOP] Fetching sleep, recovery, and workout data...');
        const [sleepData, recoveryData, workouts] = await Promise.all([
            api.getSleepForCycle(targetCycle.id),
            api.getRecoveryForCycle(targetCycle.id),
            api.getWorkoutsInDateRange(startISO, endISO) // Workouts are still best fetched by date range
        ]);

        console.log('[WHOOP] Sleep data:', sleepData ? 'found' : 'not found');
        console.log('[WHOOP] Recovery data:', recoveryData ? 'found' : 'not found');
        console.log('[WHOOP] Workouts found:', workouts?.length || 0);

        // After successful API calls, get the latest tokens from the API instance
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== whoopAccessToken) {
            console.log('WHOOP token was refreshed, updating database...');
            await prisma.user.update({
                where: { id: req.userId! },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
            console.log('Database updated with new WHOOP tokens.');
        }

        const targetWorkouts = workouts.filter((w: any) => w.start.startsWith(date));
        console.log('[WHOOP] Target workouts for date:', targetWorkouts.length);

        const result: any = {};
        const missingData: string[] = [];
        
        if (sleepData && sleepData.score) {
            result.bedtime = sleepData.start.substring(11, 16);
            result.wakeTime = sleepData.end.substring(11, 16);
            result.sleepEfficiencyPercent = sleepData.score.sleep_efficiency_percentage;
            result.sleepFulfillmentPercent = sleepData.score.sleep_performance_percentage;
            
            //v2 provides sleep debt in milliseconds
            if (sleepData.score.sleep_needed?.need_from_sleep_debt_milli) {
                result.sleepDebtMinutes = Math.round(sleepData.score.sleep_needed.need_from_sleep_debt_milli / 60000);
            } else {
                result.sleepDebtMinutes = 0;
            }
        } else {
            missingData.push('sleep');
        }
        
        if (workouts && workouts.length > 0) {
            result.didStrengthTrainingWorkout = targetWorkouts.some((w: any) => w.sport_name && w.sport_name.toLowerCase().includes('strength'));
            result.wentForRun = targetWorkouts.some((w: any) => w.sport_name && w.sport_name.toLowerCase().includes('run'));
            //v2 provides energy in kilojoules, convert to calories
            result.caloriesBurned = Math.round(targetWorkouts.reduce((total: number, w: any) => total + (w.score?.kilojoule || 0), 0) / 4.184);
        } else {
            missingData.push('workouts');
        }
        
        if (recoveryData && recoveryData.score) {
            result.restingHR = recoveryData.score.resting_heart_rate;
            result.heartRateVariability = recoveryData.score.hrv_rmssd_milli;
            // current whoop api does not provide strain... smh
            result.whoopStrainScore = null; 
            result.whoopRecoveryScorePercent = recoveryData.score.recovery_score;
        } else {
            missingData.push('recovery');
        }

        console.log('[WHOOP] Final result:', result);
        console.log('[WHOOP] Missing data types:', missingData);
        
        res.json({ 
            success: true, 
            data: result,
            missingData: missingData,
            hasAnyData: Object.keys(result).length > 0
        });
    } catch (error) {
        console.error('Error fetching WHOOP data for log:', error);
        res.status(500).json({ error: 'Failed to fetch WHOOP data' });
    }
});

router.get('/whoop/raw', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
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
        const api = whoopAPI;
        api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());

        const start = req.query.start as string;
        const end = req.query.end as string;
        if (!start || !end) {
            return res.status(400).json({ error: 'Missing start or end date (YYYY-MM-DD)' });
        }

        // Fetch all cycles in the range
        const cycles = await api.getCyclesInDateRange(start, end);
        // Fetch all sleep data for the range (by iterating cycles)
        const sleep = await Promise.all(
            cycles.map(cycle => api.getSleepForCycle(cycle.id).catch(() => null))
        );
        // Fetch all recovery data for the range (by iterating cycles)
        const recovery = await Promise.all(
            cycles.map(cycle => api.getRecoveryForCycle(cycle.id).catch(() => null))
        );
        // Fetch all workouts for the range
        const workouts = await api.getWorkoutsInDateRange(start, end);

        res.json({
            cycles,
            sleep: sleep.filter(Boolean),
            recovery: recovery.filter(Boolean),
            workouts
        });
    } catch (error) {
        console.error('Error fetching raw WHOOP data:', error);
        res.status(500).json({ error: 'Failed to fetch raw WHOOP data' });
    }
});

router.get('/whoop/debug', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
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

        const debugInfo: any = {
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

        // Step 1: Check if we have credentials
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

        // Step 2: Check if token is expired
        const isExpired = Date.now() >= user.whoopTokenExpiresAt.getTime() - 5 * 60 * 1000; // 5 min buffer
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

        // Step 3: Set up API with tokens
        const api = whoopAPI;
        api.setTokens(user.whoopAccessToken, user.whoopRefreshToken, user.whoopTokenExpiresAt.getTime());

        debugInfo.steps.push({
            step: 'api_setup',
            success: true,
            message: 'WHOOP API configured with tokens'
        });

        // Step 4: Test profile endpoint (non-critical)
        try {
            console.log('[DEBUG] Testing WHOOP profile endpoint...');
            const profile = await api.getUserProfile();
            debugInfo.steps.push({
                step: 'profile_test',
                success: true,
                message: 'Successfully fetched user profile',
                data: profile,
                critical: false
            });
        } catch (profileError: any) {
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

        // Step 5: Test a simple cycle request (critical for data access)
        try {
            console.log('[DEBUG] Testing WHOOP cycles endpoint...');
            const testDate = new Date();
            
            // Test multiple date ranges to find data
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
                
                console.log(`[DEBUG] Testing ${range.label} range: ${startDateStr} to ${endDateStr}`);
                
                try {
                    const testCycles = await api.getCyclesInDateRange(startDateStr, endDateStr);
                    console.log(`[DEBUG] Found ${testCycles?.length || 0} cycles in ${range.label} range`);
                    
                    if (testCycles && testCycles.length > 0) {
                        cycles = testCycles;
                        successfulRange = { ...range, start: startDateStr, end: endDateStr };
                        break; // Found data, stop testing
                    }
                } catch (rangeError: any) {
                    console.log(`[DEBUG] Error testing ${range.label} range:`, rangeError.message);
                }
            }
            
            console.log(`[DEBUG] Final results:`, {
                totalCycles: cycles.length,
                successfulRange,
                accessToken: `${user.whoopAccessToken?.substring(0, 10)}...`,
            });
            
            debugInfo.steps.push({
                step: 'cycles_test',
                success: true,
                message: `Successfully connected to WHOOP. Found ${cycles.length} cycles${successfulRange ? ` in ${successfulRange.label}` : ' (tested multiple ranges)'}`,
                data: {
                    testedRanges: dateRangesToTest.map(r => `${r.days} days`),
                    successfulRange,
                    totalCycles: cycles.length,
                    cycles: cycles.slice(0, 2), // Only show first 2 for brevity
                    hasData: cycles.length > 0
                },
                critical: true
            });
        } catch (cyclesError: any) {
            console.log('[DEBUG] Cycles error details:', {
                message: cyclesError.message,
                status: cyclesError.response?.status,
                statusText: cyclesError.response?.statusText,
                data: cyclesError.response?.data,
                headers: cyclesError.response?.headers,
                url: cyclesError.config?.url,
                method: cyclesError.config?.method,
                params: cyclesError.config?.params,
            });
            
            // Only mark as critical failure if it's an auth issue (401/403)
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

        // Step 6: Check if tokens were refreshed
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== user.whoopAccessToken) {
            debugInfo.steps.push({
                step: 'token_refresh',
                success: true,
                message: 'Tokens were automatically refreshed during requests'
            });
            
            // Update tokens in database
            await prisma.user.update({
                where: { id: req.userId! },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
        } else {
            debugInfo.steps.push({
                step: 'token_refresh',
                success: true,
                message: 'No token refresh was needed'
            });
        }

        res.json(debugInfo);

    } catch (error: any) {
        console.error('[DEBUG] Error in WHOOP debug endpoint:', error);
        res.status(500).json({
            success: false,
            step: 'debug_endpoint_error',
            message: 'Error in debug endpoint',
            error: error.message
        });
    }
});

// Profile endpoint for debugging
router.get('/whoop/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        console.log(`[PROFILE] Fetching WHOOP profile for user ${userId}`);

        // Get user's WHOOP credentials from database
        const user = await prisma.user.findUnique({
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

        console.log(`[PROFILE] User has WHOOP credentials, fetching profile...`);

        // Initialize WHOOP API with user's tokens
        const api = whoopAPI;
        api.setTokens(
            user.whoopAccessToken,
            user.whoopRefreshToken || '',
            user.whoopTokenExpiresAt ? user.whoopTokenExpiresAt.getTime() : Date.now() + 3600000
        );

        // Fetch user profile from WHOOP API
        const profile = await api.getUserProfile();
        
        console.log(`[PROFILE] Successfully retrieved profile:`, {
            user_id: profile.user_id,
            email: profile.email,
            name: `${profile.first_name} ${profile.last_name}`
        });

        // Check if tokens were refreshed and update them
        const newTokens = api.getTokens();
        if (newTokens && newTokens.access_token !== user.whoopAccessToken) {
            console.log(`[PROFILE] Tokens were refreshed, updating database...`);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    whoopAccessToken: newTokens.access_token,
                    whoopRefreshToken: newTokens.refresh_token,
                    whoopTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                }
            });
        }

        res.json(profile);

    } catch (error: any) {
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

        res.status(500).json({
            error: 'Failed to fetch WHOOP profile',
            details: error.message,
            status: error.response?.status
        });
    }
});


export default router; 