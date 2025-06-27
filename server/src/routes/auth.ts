import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../db/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;
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
      const user = await prisma.user.create({ 
        data: { 
          email, 
          password: hashed,
          firstName,
          lastName
        } 
      });
  
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
    res.json({ 
      token, 
      user: { 
        id: user.id,  
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      } 
    });
  });

  // POST /google-auth
  router.post('/google-auth', async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        res.status(400).json({ error: 'ID token is required' });
        return;
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { email, given_name, family_name, sub: googleId } = payload;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Check if user exists
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user with Google ID as password
        user = await prisma.user.create({
          data: {
            email,
            firstName: given_name || '',
            lastName: family_name || '',
            password: `google_${googleId}` // Store Google ID with prefix
          }
        });
      } else if (!user.password?.startsWith('google_')) {
        // Link existing user to Google account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { password: `google_${googleId}` }
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (err) {
      console.error('Google auth error:', err);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

export default router;