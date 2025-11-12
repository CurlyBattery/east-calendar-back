import { CookieOptions, Request, Response } from 'express';

export const cookieLib = (req: Request, res: Response) => {
  const get = (name: string) => {
    const value = (req.cookies as Record<string, unknown>)[name];
    return typeof value === 'string' ? value : undefined;
  };

  const set = (name: string, value: string, cookieOptions?: CookieOptions) => {
    res.cookie(name, value, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
      ...cookieOptions,
    });
  };

  const remove = (name: string) => {
    res.clearCookie(name);
  };

  return {
    get,
    set,
    remove,
  };
};
