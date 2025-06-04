import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

// POST /log – create a new daily log
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { focusScore, notes, sleepHours, hrv, strain, dietSummary, screenTime } = req.body;

  try {
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
      },
    });
    res.status(201).json(log);
  } catch {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// GET /logs – get all logs for current user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;