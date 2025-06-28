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
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    // Initialize WHOOP API with the authorization code
    await whoopAPI.initialize(authorizationCode);

    // Get the tokens from the WHOOP API instance
    const tokens = {
      access_token: whoopAPI.getAccessToken(),
      refresh_token: whoopAPI.getRefreshToken(),
      expires_in: whoopAPI.getTokenExpiry() ? Math.floor((whoopAPI.getTokenExpiry()! - Date.now()) / 1000) : null,
      token_type: 'Bearer'
    };

    // Store the credentials in the database
    await prisma.user.update({
      where: { id: req.userId! },
      data: {
        whoopCredentials: tokens
      }
    });

    res.json({ 
      success: true, 
      message: 'WHOOP credentials stored successfully' 
    });
  } catch (error) {
    console.error('WHOOP authentication error:', error);
    res.status(500).json({ error: 'Failed to authenticate with WHOOP' });
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
        whoopCredentials: null
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

export default router; 