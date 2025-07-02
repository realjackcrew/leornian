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

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
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
    await prisma.$connect();
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

