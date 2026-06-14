import { Request, Response, NextFunction } from 'express';
import { isMobileUserAgent } from '../utils/userAgent';

export function mobileOnlyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userAgent = req.headers['user-agent'];

  if (!isMobileUserAgent(userAgent)) {
    res.status(403).json({
      message: 'Esta aplicación solo está disponible para dispositivos móviles.',
      code: 'DESKTOP_BLOCKED',
    });
    return;
  }

  next();
}
