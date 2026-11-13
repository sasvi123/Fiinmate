import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testDbConnection } from './config/db';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';

const envPath = fs.existsSync(path.resolve(__dirname, '../.env'))
  ? path.resolve(__dirname, '../.env')
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'FinWise API server is running',
    timestamp: new Date().toISOString(),
  });
});

// Database connectivity check endpoint
app.get('/api/db-test', async (req: Request, res: Response) => {
  const isConnected = await testDbConnection();
  if (isConnected) {
    res.status(200).json({
      status: 'connected',
      message: 'Successfully reached Aiven MySQL database',
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Could not connect to Aiven MySQL database. Check .env credentials.',
    });
  }
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(` FinWise backend server running on http://localhost:${PORT}`);
  console.log(` Health check available at: http://localhost:${PORT}/api/health`);
  console.log(' Testing database connection on startup...');
  await testDbConnection();
});

