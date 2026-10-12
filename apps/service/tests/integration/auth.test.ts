import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import app from '../../src/index';
import { AUTHENTICATION_NOT_CONFIGURED } from '../../src/api/routes/auth';

let server: Server | undefined;

async function postAuthCallback(headers: Record<string, string>): Promise<Response> {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server?.once('listening', resolve));
  const address = server.address() as AddressInfo;

  return fetch(`http://127.0.0.1:${address.port}/api/auth/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ authCode: 'not-a-real-provider-code' }),
  });
}

afterEach(async () => {
  if (!server?.listening) return;
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => error ? reject(error) : resolve());
  });
  server = undefined;
});

describe('authentication boundary', () => {
  it('preserves CSRF rejection before the unavailable callback', async () => {
    const response = await postAuthCallback({});

    expect(response.status).toBe(403);
    expect(await response.text()).toContain('CSRF protection');
  });

  it('does not claim that DemoProvider performed real provider authentication', async () => {
    const response = await postAuthCallback({ 'X-Requested-With': 'XMLHttpRequest' });

    expect(response.status).toBe(501);
    expect(await response.text()).toContain(AUTHENTICATION_NOT_CONFIGURED);
  });
});
