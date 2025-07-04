import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';

const router = Router();

// GET /api/user/profile - Get user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    
    const user = await database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { firstName, lastName, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await database.user.findUnique({
        where: { email }
      });
      
      if (existingUser && existingUser.id !== userId) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const updatedUser = await database.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Update user profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 