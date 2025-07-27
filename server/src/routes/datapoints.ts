import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import database from '../db/database';
import { masterDatapointDefinitions } from '../llm/datapointDefinitions';

const router = Router();

// Immutable baseline (deep cloned once)
const baselineDatapointDefinitions: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(masterDatapointDefinitions));

// GET /api/datapoints/definitions - Get master datapoint definitions
router.get('/definitions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    
    // Deep clone baseline each request to avoid in-memory mutation
    const allDefinitions: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(baselineDatapointDefinitions));

    // Get custom datapoints for this user
    const customDatapoints = await database.datapointPreference.findMany({
      where: {
        userId,
        category: {
          in: Object.keys(masterDatapointDefinitions)
        },
        datapoint: {
          startsWith: '{'
        }
      },
      select: {
        category: true,
        datapoint: true
      }
    });

    // Parse custom datapoints and add them to their respective categories
    customDatapoints.forEach(pref => {
      if (typeof pref.datapoint === 'string' && pref.datapoint.trim().startsWith('{')) {
        try {
          const definition = JSON.parse(pref.datapoint);
          const category = pref.category as string;
          if (!allDefinitions[category]) {
            allDefinitions[category] = {};
          }
          allDefinitions[category][definition.name] = {
            type: definition.type,
            label: definition.label,
            description: definition.description,
            min: definition.min,
            max: definition.max,
            step: definition.step
          };
        } catch (e) {
          console.error('Failed to parse custom datapoint definition:', e);
        }
      }
    });

    res.json(allDefinitions);
  } catch (err) {
    console.error('Get datapoint definitions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datapoints/preferences - Get user's datapoint preferences
router.get('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const preferences = await database.datapointPreference.findMany({
      where: { userId },
      select: {
        category: true,
        datapoint: true,
        enabled: true
      }
    });

    // Convert to the format expected by the frontend
    const preferencesMap: Record<string, Record<string, boolean>> = {};
    preferences.forEach(pref => {
      if (!preferencesMap[pref.category]) {
        preferencesMap[pref.category] = {};
      }
      preferencesMap[pref.category][pref.datapoint] = pref.enabled;
    });

    // Remove preferences for custom datapoints that no longer exist
    const customDefinitions = await database.datapointPreference.findMany({
      where: {
        userId,
        category: { in: Object.keys(masterDatapointDefinitions) },
        datapoint: { startsWith: '{' }
      },
      select: { category: true, datapoint: true }
    });
    const validCustomNames = new Set(
      customDefinitions.map(pref => {
        try {
          return JSON.parse(pref.datapoint).name;
        } catch { return null; }
      }).filter(Boolean)
    );
    Object.keys(preferencesMap).forEach(category => {
      Object.keys(preferencesMap[category]).forEach(datapoint => {
        if (datapoint.startsWith('custom') && !validCustomNames.has(datapoint)) {
          delete preferencesMap[category][datapoint];
        }
      });
    });

    res.json(preferencesMap);
  } catch (err) {
    console.error('Get datapoint preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/datapoints/preferences - Save user's datapoint preferences
router.post('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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

    // Start a transaction to update all preferences
    await database.$transaction(async (tx) => {
      // Delete existing preferences for this user (except custom datapoints)
      await tx.datapointPreference.deleteMany({
        where: { 
          userId,
          OR: [
            {
              category: {
                notIn: Object.keys(masterDatapointDefinitions)
              }
            },
            {
              datapoint: {
                not: {
                  startsWith: '{'
                }
              }
            }
          ]
        }
      });

      // Insert new preferences
      const preferencesToInsert: Array<{
        userId: string;
        category: string;
        datapoint: string;
        enabled: boolean;
      }> = [];

      // Get current valid custom datapoints to filter against
      const validCustomDatapoints = await tx.datapointPreference.findMany({
        where: {
          userId,
          category: { in: Object.keys(masterDatapointDefinitions) },
          datapoint: { startsWith: '{' }
        },
        select: { category: true, datapoint: true }
      });
      const validCustomNames = new Set(
        validCustomDatapoints.map(pref => {
          try {
            return JSON.parse(pref.datapoint).name;
          } catch { return null; }
        }).filter(Boolean)
      );
      
      Object.entries(preferences).forEach(([category, datapoints]) => {
        if (typeof datapoints === 'object' && datapoints !== null) {
          Object.entries(datapoints as Record<string, unknown>).forEach(([datapoint, enabled]) => {
            if (typeof enabled === 'boolean' && category && datapoint) {
              // Skip custom datapoints that no longer exist
              if (datapoint.startsWith('custom') && !validCustomNames.has(datapoint)) {
                return;
              }
              preferencesToInsert.push({
                userId,
                category,
                datapoint,
                enabled
              });
            }
          });
        }
      });

      if (preferencesToInsert.length > 0) {
        await tx.datapointPreference.createMany({
          data: preferencesToInsert
        });
      }
    });

    res.json({ message: 'Datapoint preferences saved successfully' });
  } catch (err) {
    console.error('Save datapoint preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datapoints/enabled - Get only enabled datapoints for the user
router.get('/enabled', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    
    const preferences = await database.datapointPreference.findMany({
      where: { 
        userId,
        enabled: true
      },
      select: {
        category: true,
        datapoint: true
      }
    });

    // If no preferences found, return all datapoints as enabled by default
    if (preferences.length === 0) {
      res.json(masterDatapointDefinitions);
      return;
    }

    // Filter master definitions to only include enabled datapoints
    const enabledDatapoints: Record<string, Record<string, any>> = {};
    preferences.forEach(pref => {
      if (!enabledDatapoints[pref.category]) {
        enabledDatapoints[pref.category] = {};
      }
      const category = pref.category as string;
      const datapoint = pref.datapoint as string;
      
      // Handle custom datapoints (stored as JSON in datapoint field)
      if (datapoint.startsWith('{')) {
        try {
          const definition = JSON.parse(datapoint);
          enabledDatapoints[category][definition.name] = {
            type: definition.type,
            label: definition.label,
            description: definition.description,
            min: definition.min,
            max: definition.max,
            step: definition.step
          };
        } catch (e) {
          console.error('Failed to parse custom datapoint definition:', e);
        }
      } else {
        // Handle standard datapoints
        const categoryDefinitions = masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions];
        if (categoryDefinitions && categoryDefinitions[datapoint as keyof typeof categoryDefinitions]) {
          enabledDatapoints[category][datapoint] = categoryDefinitions[datapoint as keyof typeof categoryDefinitions];
        }
      }
    });

    res.json(enabledDatapoints);
  } catch (err) {
    console.error('Get enabled datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/datapoints/custom - Create a new custom datapoint
router.post('/custom', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { label, type, description, min, max, step, category } = req.body;

    if (!label || !type || !category) {
      res.status(400).json({ error: 'Label, type, and category are required' });
      return;
    }

    // Validate category exists in master definitions
    if (!masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions]) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    // Generate a no-space name from the label
    const generateName = (label: string): string => {
      return 'custom' + label
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    };

    const name = generateName(label);
    const definition = {
      name,
      label,
      type,
      description: description || '',
      min: type === 'number' ? (min || 0) : undefined,
      max: type === 'number' ? (max || 100) : undefined,
      step: type === 'number' ? (step || 1) : undefined,
      category
    };

    // Check if custom datapoint already exists in this category
    const existing = await database.datapointPreference.findFirst({
      where: {
        userId,
        category,
        datapoint: JSON.stringify(definition)
      }
    });

    if (existing) {
      res.status(400).json({ error: 'A custom datapoint with this name already exists in this category' });
      return;
    }

    // Create the custom datapoint
    await database.datapointPreference.create({
      data: {
        userId,
        category,
        datapoint: JSON.stringify(definition),
        enabled: true
      }
    });

    res.json({ 
      message: 'Custom datapoint created successfully',
      datapoint: definition
    });
  } catch (err) {
    console.error('Create custom datapoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/datapoints/custom/:category/:name - Delete a custom datapoint
router.delete('/custom/:category/:name', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { category, name } = req.params;
    console.log('Attempting to delete custom datapoint:', { userId, category, name });

    // Validate category exists in master definitions
    if (!masterDatapointDefinitions[category as keyof typeof masterDatapointDefinitions]) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    // Find and delete the custom datapoint - delete ALL references to it
    const deleted = await database.datapointPreference.deleteMany({
      where: {
        userId,
        category,
        OR: [
          {
            datapoint: {
              contains: `"name":"${name}"`
            }
          },
          {
            datapoint: name
          }
        ]
      }
    });

    console.log('Delete result:', deleted);

    if (deleted.count === 0) {
      // Let's check what custom datapoints exist for this user and category
      const existingCustomDatapoints = await database.datapointPreference.findMany({
        where: {
          userId,
          category,
          datapoint: {
            startsWith: '{'
          }
        },
        select: {
          datapoint: true
        }
      });
      console.log('Existing custom datapoints in category:', category, existingCustomDatapoints);
      
      res.status(404).json({ error: 'Custom datapoint not found' });
      return;
    }

    res.json({ message: 'Custom datapoint deleted successfully' });
  } catch (err) {
    console.error('Delete custom datapoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datapoints/custom - Get all custom datapoints for the user
router.get('/custom', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const customDatapoints = await database.datapointPreference.findMany({
      where: {
        userId,
        category: {
          in: Object.keys(masterDatapointDefinitions)
        },
        datapoint: {
          startsWith: '{'
        }
      },
      select: {
        category: true,
        datapoint: true,
        enabled: true
      }
    });

    const parsedDatapoints = customDatapoints.map(pref => {
      try {
        const definition = JSON.parse(pref.datapoint);
        return {
          ...definition,
          category: pref.category,
          enabled: pref.enabled
        };
      } catch (e) {
        console.error('Failed to parse custom datapoint:', e);
        return null;
      }
    }).filter(Boolean);

    res.json(parsedDatapoints);
  } catch (err) {
    console.error('Get custom datapoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 