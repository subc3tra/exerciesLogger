import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';

import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import programRouter from './routes/program.routes';
import sessionRouter from './routes/session.routes';
import feedbackRouter from './routes/feedback.routes';

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
app.use('/api/programs', programRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/feedback', feedbackRouter);

app.use(errorHandler)

export default app;