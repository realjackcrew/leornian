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

export default router; 