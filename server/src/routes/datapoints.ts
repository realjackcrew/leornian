import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userDatapoints = await database.userDatapoint.findMany({
      where: { userId },
    });

    const definitions: Record<string, Record<string, any>> = {};
    const preferences: Record<string, Record<string, boolean>> = {};

    userDatapoints.forEach(dp => {
      if (!definitions[dp.category]) {
        definitions[dp.category] = {};
        preferences[dp.category] = {};
      }

      definitions[dp.category][dp.name] = {
        type: dp.type,
        label: dp.label,
        min: dp.min,
        max: dp.max,
        step: dp.step,
      };
      
      // For now, all datapoints are considered enabled.
      // This will be updated later to reflect the user's actual preferences.
      preferences[dp.category][dp.name] = dp.enabled; 
    });

    res.json({
      definitions,
      preferences,
      custom: [], // This can be deprecated on the frontend later
    });

  } catch (err) {
    console.error('Get datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/enabled', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userDatapoints = await database.userDatapoint.findMany({
      where: { userId, enabled: true },
    });

    const enabledDatapoints: Record<string, Record<string, any>> = {};
    userDatapoints.forEach(dp => {
      if (!enabledDatapoints[dp.category]) {
        enabledDatapoints[dp.category] = {};
      }
      enabledDatapoints[dp.category][dp.name] = {
        type: dp.type,
        label: dp.label,
        min: dp.min,
        max: dp.max,
        step: dp.step,
      };
    });

    res.json(enabledDatapoints);
  } catch (err) {
    console.error('Get enabled datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/enabled', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
      res.status(400).json({ error: 'Invalid preferences format' });
      return;
    }

    await database.$transaction(async (tx) => {
      for (const category in preferences) {
        for (const datapointName in preferences[category]) {
          const enabled = preferences[category][datapointName];
          await tx.userDatapoint.updateMany({
            where: {
              userId,
              category,
              name: datapointName,
            },
            data: {
              enabled,
            },
          });
        }
      }
    });

    res.json({ message: 'Datapoint preferences saved successfully' });
  } catch (err) {
    console.error('Save datapoint preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { category, name: providedName, label, type, min, max, step } = req.body;

    if (!category || !label || !type || !providedName) {
      res.status(400).json({ error: 'Missing required datapoint fields: category, name, label, and type are required' });
      return;
    }

    // Generate a unique name for the datapoint if not provided
    const name = providedName || `${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    const newDatapoint = await database.userDatapoint.create({
      data: {
        userId,
        category,
        name,
        label,
        type,
        min,
        max,
        step,
        enabled: true, // New datapoints are enabled by default
      },
    });

    res.status(201).json(newDatapoint);
  } catch (err) {
    console.error('Create datapoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { datapoints } = req.body; // Expecting an array of { category, name }

    if (!datapoints || !Array.isArray(datapoints)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    await database.$transaction(async (tx) => {
      for (const dp of datapoints) {
        await tx.userDatapoint.deleteMany({
          where: {
            userId,
            category: dp.category,
            name: dp.name,
          },
        });
      }
    });

    res.json({ message: 'Datapoints deleted successfully' });
  } catch (err) {
    console.error('Delete datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:category/:name', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { category, name } = req.params;
    const { label, type, min, max, step } = req.body;

    if (!label || !type) {
      res.status(400).json({ error: 'Missing required fields: label and type are required' });
      return;
    }

    const updatedDatapoint = await database.userDatapoint.update({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      data: {
        label,
        type,
        min,
        max,
        step,
      },
    });

    res.json(updatedDatapoint);
  } catch (err) {
    console.error('Update datapoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/category/:category', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { category } = req.params;

    await database.userDatapoint.deleteMany({
      where: {
        userId,
        category,
      },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;