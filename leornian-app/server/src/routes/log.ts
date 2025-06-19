import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';
import { zonedTimeToUtc } from 'date-fns-tz';

const router = Router();

const CHICAGO = 'America/Chicago';

// Convert a date string and time string in Chicago time to a UTC Date
function createChicagoDate(dateString: string, timeString: string): Date {
  const dateTimeString = `${dateString}T${timeString}`;
  return zonedTimeToUtc(dateTimeString, CHICAGO);
}

// POST /log – create a new daily log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { healthData, date } = req.body;

  try {
    // If a specific date is provided, save it in the middle of that day in
    // the Chicago timezone. This avoids DST issues while ensuring the log is
    // associated with the correct calendar date.
    const createdAt = date
      ? zonedTimeToUtc(`${date}T12:00:00`, CHICAGO)
      : new Date();
    
    // Check if this is comprehensive health data or legacy format
    const log = await prisma.dailyLog.create({
      data: {
        userId: req.userId!,
        healthData: {
          ...healthData,
          timezone: healthData.timezone || 'America/Chicago' // Default to Central time if not specified
        },
        notes: healthData.notes, // Extract notes from healthData if available
        createdAt: createdAt,
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

// GET /log/date/:date – get log for specific date
router.get('/log/date/:date', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { date } = req.params;
  console.log('GET /log/date/:date route hit with date:', date);
  console.log('Full URL:', req.originalUrl);
  console.log('User ID:', req.userId);

  try {
    // Create start and end dates for the day in the Chicago timezone
    const startDate = createChicagoDate(date, '00:00:00');
    const endDate = createChicagoDate(date, '23:59:59.999');

    console.log('Searching for logs between:', startDate.toISOString(), 'and', endDate.toISOString());

    const log = await prisma.dailyLog.findFirst({
      where: {
        userId: req.userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!log) {
      console.log('No log found for date:', date);
      res.status(404).json({ error: 'Log not found for this date' });
      return;
    }

    console.log('Found log:', log.id, 'created at:', log.createdAt.toISOString());
    res.json(log);
  } catch (error) {
    console.error('Failed to fetch log by date:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
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