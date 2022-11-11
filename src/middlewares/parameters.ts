import { difference } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

type ParameterCheckResult = {
  status: 'ok' | 'missing';
  message?: string;
};

function validate(params: Record<string, unknown>, requiredFields: string[]): ParameterCheckResult {
  const missing = difference(requiredFields, Object.keys(params));

  if (missing.length === 0) return { status: 'ok' };

  return {
    status: 'missing',
    message: `Missing mandatory parameter(s): ${missing.map((mp) => `"${mp}"`).join(', ')}`,
  };
}

export function requireParameters(requiredFields: { query?: string[]; body?: string[] }) {
  return function middleware(req: Request, res: Response, next: NextFunction) {
    const { status, message } = validate(
      Object.assign({}, req.query, req.body),
      Array<string>()
        .concat(requiredFields.query || [])
        .concat(requiredFields.body || [])
    );

    if (status === 'ok') return next();

    return res.status(StatusCodes.BAD_REQUEST).json({ message });
  };
}

export default { middleware: requireParameters };
