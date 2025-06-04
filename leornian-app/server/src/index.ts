import express, { NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import logRoutes from './routes/log';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/auth', authRoutes); //double check 
app.use('/logs', logRoutes);
const PORT = process.env.PORT || 4000;


app.get('/', (_req, res) => {
    res.send('Leornian API is running.');
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error('Global error handler caught:', err.stack);
//   res.status(500).json({ error: 'Unhandled server error' });
// });