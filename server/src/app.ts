import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health.route';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api', healthRouter);

export default app;