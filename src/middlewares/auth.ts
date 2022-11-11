import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import jwt, { JwtPayload } from 'jsonwebtoken';

export function requireAuth() {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.substring(7) || '';

    jwt.verify(token, 'tdsoft.2022.2', async (response) => {
      const decoded = jwt.decode(token) as JwtPayload;

      if (response === null) {
        if (!req.locals) req.locals = {};
        req.locals.authenticated = true;
        req.locals.user = decoded.email;
        req.locals.roles = decoded.roles;
        return next();
      }

      res.status(StatusCodes.UNAUTHORIZED).json({ message: response.message });
    });
  };
}

export default { middleware: requireAuth };
