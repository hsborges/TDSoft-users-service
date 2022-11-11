// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      locals: {
        authenticated?: boolean;
        user?: string;
        roles?: Array<'USER' | 'ADMIN'>;
        [key: string]: any;
      };
    }
  }
}
