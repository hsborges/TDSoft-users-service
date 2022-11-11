import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function requireRole(role: 'ADMIN' | 'USER') {
  return function (req: Request, res: Response, next: NextFunction) {
    if (req.locals.authenticated && req.locals.roles?.includes(role)) return next();
    return res.sendStatus(StatusCodes.FORBIDDEN);
  };
}

export default { middleware: requireRole };
