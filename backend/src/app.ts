import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);
app.use(errorMiddleware);

// Manejador de 404 explícito para evitar respuestas HTML o texto plano.
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
