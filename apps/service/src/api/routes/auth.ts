import { Router, Request, Response } from 'express';

export const authRouter = Router();
export const AUTHENTICATION_NOT_CONFIGURED = 'Provider account authentication is not configured in this demo service.';

/**
 * A real callback requires an approved provider-authentication and credential
 * persistence design. DemoProvider must not stand in for that boundary.
 */
authRouter.post('/callback', (_req: Request, res: Response): void => {
  res.status(501).json({ error: AUTHENTICATION_NOT_CONFIGURED });
});
