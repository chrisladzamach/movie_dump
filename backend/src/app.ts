import express from 'express';
import cors from 'cors';
import routes from './routes';
import { mobileOnlyMiddleware } from './middlewares/mobileOnly.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', mobileOnlyMiddleware, routes);
app.use(errorMiddleware);

export default app;
