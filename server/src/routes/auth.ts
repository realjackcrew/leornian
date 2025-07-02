import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../db/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// In-memory storage for reset tokens (in production, use Redis or similar)
const resetTokens = new Map<string, { code: string; expiresAt: number }>();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;
      console.log('Register request received:', { email, firstName, lastName });
      console.log('Request body:', req.body);
  
      if (!email || !password) {
        console.warn('Missing email or password in request body');
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
  
      // Test database connection
      try {
        await prisma.$connect();
        console.log('Database connection successful');
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        res.status(500).json({ error: 'Database connection failed' });
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
          firstName: firstName || '',
          lastName: lastName || ''
        } 
      });
  
      console.log('User created with ID:', user.id);
      res.status(201).json({ userId: user.id });
    } catch (err) {
      console.error('Unexpected register error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err instanceof Error ? err.message : 'Unknown error' : undefined
      });
    }
  });

  // POST /login
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password, rememberMe } = req.body;
  
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
  
    // Set token expiration based on rememberMe flag
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
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
      const { idToken, rememberMe } = req.body;
      
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

      // Set token expiration based on rememberMe flag
      const expiresIn = rememberMe ? '30d' : '2h';
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
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

  // POST /forgot-password
  router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { email } });
      
      // Always return success for security (don't reveal if email exists)
      if (user) {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the code in memory with expiration (15 minutes)
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        resetTokens.set(email, { code, expiresAt });

        // TODO: Send email with the code
        // For now, we'll just log it (in production, use a proper email service)
        console.log(`Password reset code for ${email}: ${code}`);
      }

      res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /verify-reset-code
  router.post('/verify-reset-code', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(400).json({ error: 'Invalid code' });
        return;
      }

      // Verify the reset code
      const storedReset = resetTokens.get(email);
      if (!storedReset || storedReset.code !== code || Date.now() > storedReset.expiresAt) {
        res.status(400).json({ error: 'Invalid code' });
        return;
      }

      // Remove the used code
      resetTokens.delete(email);

      // Create a verification token that expires in 5 minutes
      const verificationToken = jwt.sign(
        { email, type: 'password_reset_verification' }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
      );

      res.json({ verificationToken });
    } catch (err) {
      console.error('Verify reset code error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /reset-password
  router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword, verificationToken } = req.body;
      
      if (!email || !newPassword || !verificationToken) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      // Verify the verification token
      try {
        const decoded = jwt.verify(verificationToken, JWT_SECRET) as any;
        
        if (decoded.email !== email || decoded.type !== 'password_reset_verification') {
          res.status(400).json({ error: 'Invalid verification token' });
          return;
        }
      } catch (jwtError) {
        res.status(400).json({ error: 'Invalid or expired verification token' });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export default router;