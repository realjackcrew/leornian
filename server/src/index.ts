import express, { NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/database';
import authRoutes from './routes/auth';
import logRoutes from './routes/log';
import queryRoutes from './routes/query';
import chatRoutes from './routes/chat';
import whoopRoutes from './routes/whoop';
dotenv.config();

const app = express();

// Configure CORS based on environment
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://leo.jackcrew.net', // Production client URL
  process.env.CLIENT_URL,  // Additional production client URL
].filter(Boolean); // Remove any undefined values

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS blocked origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', logRoutes);
app.use('/api', queryRoutes);
app.use('/api', chatRoutes);
app.use('/api', whoopRoutes);

const PORT = process.env.PORT || 4000;

// Add a catch-all route for unmatched API routes
app.use('/api/*', (req, res) => {
  console.log('Unmatched API route:', req.method, req.originalUrl);
  res.status(404).json({ error: 'API route not found' });
});

app.get('/', (_req, res) => {
    res.send('Leornian API is running.');
  });

app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log('Environment check:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('- CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
});

