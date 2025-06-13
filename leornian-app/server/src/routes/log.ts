import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// POST /log – create a new daily log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { focusScore, notes, sleepHours, hrv, strain, dietSummary, screenTime, healthData } = req.body;

  try {
    // Check if this is comprehensive health data or legacy format
    if (healthData) {
      // New comprehensive format
      const log = await prisma.dailyLog.create({
        data: {
          userId: req.userId!,
          healthData: {
            ...healthData,
            timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
          },
          notes: healthData.notes || notes, // Extract notes from healthData if available
        } as any,
      });
      console.log('Received comprehensive health log:', req.body);
      res.status(201).json(log);
    } else {
      // Legacy format for backward compatibility
      const log = await prisma.dailyLog.create({
        data: {
          userId: req.userId!,
          focusScore,
          notes,
          sleepHours,
          hrv,
          strain,
          dietSummary,
          screenTime,
          healthData: {
            timezone: 'America/Chicago' // Add timezone for legacy entries
          }
        },
      });
      console.log('Received legacy log:', req.body);
      res.status(201).json(log);
    }
  } catch (error) {
    console.error('Failed to create log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// GET /logs – get all logs for current user
router.get('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// PUT /log/:id – update an existing log
router.put('/log/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { focusScore, notes, sleepHours, hrv, strain, dietSummary, screenTime, healthData } = req.body;

  try {
    // Verify log belongs to user
    const existingLog = await prisma.dailyLog.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingLog) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }

    // Update with comprehensive or legacy data
    const updateData: any = {};

    if (healthData) {
      updateData.healthData = {
        ...healthData,
        timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
      };
      updateData.notes = healthData.notes || notes;
    } else {
      updateData.focusScore = focusScore;
      updateData.notes = notes;
      updateData.sleepHours = sleepHours;
      updateData.hrv = hrv;
      updateData.strain = strain;
      updateData.dietSummary = dietSummary;
      updateData.screenTime = screenTime;
      updateData.healthData = {
        timezone: 'America/Chicago' // Add timezone for legacy entries
      };
    }

    const log = await prisma.dailyLog.update({
      where: { id },
      data: updateData,
    });

    res.json(log);
  } catch (error) {
    console.error('Failed to update log:', error);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

export default router;