import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// POST /log – create a new daily log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { healthData } = req.body;

  try {
    // Check if this is comprehensive health data or legacy format
    const log = await prisma.dailyLog.create({
      data: {
        userId: req.userId!,
        healthData: {
          ...healthData,
          timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
        },
        notes: healthData.notes, // Extract notes from healthData if available
      } as any,
    });
    res.status(201).json(log);
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
  const { healthData } = req.body;

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

    
    updateData.healthData = {
      ...healthData,
      timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
    };
    updateData.notes = healthData.notes;

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