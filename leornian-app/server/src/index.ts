import express, { NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import logRoutes from './routes/log';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', authRoutes); //double check original /auth and /logs
app.use('/api', logRoutes);
const PORT = process.env.PORT || 4000;


app.get('/', (_req, res) => {
    res.send('Leornian API is running.');
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

