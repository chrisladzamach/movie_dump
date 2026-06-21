import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  res.status(500).json({ message });
}
