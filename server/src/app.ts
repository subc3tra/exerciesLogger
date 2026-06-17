import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';

import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', healthRouter);
app.use('/api/auth/', authRouter);

app.use(errorHandler)

export default app;