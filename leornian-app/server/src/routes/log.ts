import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/database';

const router = Router();

// POST /log – create a new daily log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { healthData, date } = req.body; // date is expected in YYYY-MM-DD format

  try {
    // If no date is provided, generate today's date in Chicago time.
    // 'en-CA' gives YYYY-MM-DD format.
    const logDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

    const log = await prisma.dailyLog.create({
      data: {
        userId: req.userId!,
        date: logDate,
        healthData: {
          ...healthData,
          timezone: healthData.timezone || 'America/Chicago', // Default to Central time if not specified
        },
      },
    });
    res.status(201).json(log);
  } catch (error: any) {
    console.error('Failed to create log:', error);
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A log for this date already exists.' });
      return;
    }
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

// GET /log/by-date – get log for specific date
router.get('/log/by-date', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Date parameter is required' });
    return;
  }

  try {
    const log = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: req.userId!,
          date: date,
        },
      },
    });

    if (!log) {
      res.status(404).json({ error: 'Log not found for this date' });
      return;
    }

    res.json(log);
  } catch (error) {
    console.error('Failed to fetch log by date:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

// PUT /log/update – update an existing log
router.put('/log/update', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.query;
  const { healthData } = req.body;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Log ID is required' });
    return;
  }

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