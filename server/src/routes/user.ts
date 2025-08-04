import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';
import { getAvailableVoices, getAvailableVerbosities } from '../llm/promptBuilder';
const router = Router();
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredName: true
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
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { firstName, lastName, email, preferredName } = req.body;
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
        email: email || undefined,
        preferredName: preferredName || undefined
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredName: true
      }
    });
    res.json(updatedUser);
  } catch (err) {
    console.error('Update user profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/chat-settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const settings = user.settings as any || {};
    const chatSettings = {
      voice: settings.voice || 'default',
      verbosity: settings.verbosity || 'balanced',
      model: settings.model || 'gpt-4o-mini'
    };
    res.json(chatSettings);
  } catch (err) {
    console.error('Get chat settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/chat-settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { voice, verbosity, model } = req.body;
    if (voice && !getAvailableVoices().includes(voice)) {
      res.status(400).json({ error: 'Invalid voice selection' });
      return;
    }
    if (verbosity && !getAvailableVerbosities().includes(verbosity)) {
      res.status(400).json({ error: 'Invalid verbosity selection' });
      return;
    }
    const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'];
    if (model && !validModels.includes(model)) {
      res.status(400).json({ error: 'Invalid model selection' });
      return;
    }
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const currentSettings = user.settings as any || {};
    const updatedSettings = {
      ...currentSettings,
      ...(voice && { voice }),
      ...(verbosity && { verbosity }),
      ...(model && { model })
    };
    const updatedUser = await database.user.update({
      where: { id: userId },
      data: { settings: updatedSettings },
      select: { settings: true }
    });
    const settings = updatedUser.settings as any || {};
    const chatSettings = {
      voice: settings.voice || 'default',
      verbosity: settings.verbosity || 'balanced',
      model: settings.model || 'gpt-4o-mini'
    };
    res.json(chatSettings);
  } catch (err) {
    console.error('Update chat settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/chat-options', (_req, res) => {
  try {
    res.json({
      voices: getAvailableVoices(),
      verbosities: getAvailableVerbosities(),
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini']
    });
  } catch (err) {
    console.error('Get chat options error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default router; 