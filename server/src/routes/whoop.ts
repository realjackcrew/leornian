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
    
    // Use the (potentially new) accessToken to fetch data.
    const api = whoopAPI;
    api.setTokens(whoopAccessToken, whoopRefreshToken, whoopTokenExpiresAt.getTime());

    const profile = await api.getUserProfile();

    if (profile && profile.user_id) {
      res.json({ success: true, message: `Successfully connected to WHOOP as ${profile.first_name} ${profile.last_name}.` });
    } else {
      res.status(400).json({ success: false, message: 'Connection test failed. Could not retrieve WHOOP user profile.' });
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


export default router; 