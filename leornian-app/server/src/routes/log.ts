import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// Helper function to create a date in Chicago timezone
function createChicagoDate(dateString: string, timeString: string): Date {
  // Create date in Chicago timezone by adjusting for UTC offset
  const dateTimeString = `${dateString}T${timeString}`;
  const date = new Date(dateTimeString);
  
  // Get Chicago timezone offset (UTC-5 or UTC-6 depending on DST)
  const chicagoOffset = date.getTimezoneOffset() + (5 * 60); // Chicago is UTC-5
  date.setMinutes(date.getMinutes() + chicagoOffset);
  
  return date;
}

// POST /log – create a new daily log
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { healthData, date } = req.body;

  try {
    // If a specific date is provided, save it at noon UTC on that date
    // This ensures the log is always saved on the correct Central date
    // regardless of when the request is made
    const createdAt = date ? new Date(date + 'T17:00:00.000Z') : new Date();
    // 17:00 UTC = 12:00 Central (UTC-5)
    
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
    // Create start and end dates for the Chicago timezone day
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