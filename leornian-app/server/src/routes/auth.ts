import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// router.post('/register', async (req: Request, res: Response): Promise<void> => {
//     const { email, password, name } = req.body;
  
//     if (!email || !password) {
//       res.status(400).json({ error: 'Email and password are required' });
//       return;
//     }
  
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       res.status(400).json({ error: 'email already in use' });
//       return;
//     }
  
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { email, password: hashedPassword },
//     });
  
//     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
//     res.json({ token, user: { id: user.id, email: user.email} });
//   });
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log('Register request received:', email);
  
      if (!email || !password) {
        console.warn('Missing email or password in request body');
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
  
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        console.log('Email already exists:', email);
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
  
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hashed } });
  
      console.log('User created with ID:', user.id);
      res.status(201).json({ userId: user.id });
    } catch (err) {
      console.error('Unexpected register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // POST /login
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
  
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  });
  
  export default router;