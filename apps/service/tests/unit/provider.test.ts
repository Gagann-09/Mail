import { describe, it, expect } from 'vitest';
import { encryptProviderCredentials, decryptProviderCredentials } from '../../src/security/kms';
import { DemoProvider } from '../../src/providers/demoProvider';
import { IProviderAdapter } from '../../src/providers/IProviderAdapter';

describe('Authentication Boundary and Provider Abstraction', () => {
  it('encrypts and decrypts credentials successfully without data loss', () => {
    const rawCredentials = JSON.stringify({ accessToken: 'super-secret', refreshToken: 'refresh' });
    const encrypted = encryptProviderCredentials(rawCredentials);
    
    expect(encrypted.data).not.toContain('super-secret'); // Assure it's encrypted
    expect(encrypted.iv).toBeDefined();
    
    const decrypted = decryptProviderCredentials(encrypted);
    expect(decrypted).toBe(rawCredentials);
  });

  it('demo provider authenticates and returns normalized credentials', async () => {
    const provider: IProviderAdapter = new DemoProvider();
    const creds = await provider.authenticate('valid_code');
    expect(creds.accessToken).toBe('demo_access_token');
  });

  it('demo provider syncs agnostic domain messages, not provider-specific structures', async () => {
    const provider: IProviderAdapter = new DemoProvider();
    const result = await provider.syncMailbox();
    
    expect(result.messages.length).toBe(3);
    const msg = result.messages[0];
    
    // Verify provider specific concepts don't leak (e.g., Gmail's 'labelIds' should not exist in the domain model)
    expect((msg as any).labelIds).toBeUndefined();
    expect(msg.providerId).toBe('demo-prov-1');
    expect(msg.from.email).toBe('alice@example.com');
  });

  it('demo provider tracks state changes for mutation and sending', async () => {
    const provider: IProviderAdapter = new DemoProvider();
    await provider.mutateMessage('demo-prov-1', 'trash');
    
    // Perform a new sync to verify it was updated
    const newSync = await provider.syncMailbox();
    expect(newSync.messages.length).toBe(3);
    const trashedMsg = newSync.messages.find(m => m.providerId === 'demo-prov-1');
    expect(trashedMsg?.labels).toContain('TRASH');
    expect(trashedMsg?.labels).not.toContain('INBOX');
    
    // Send a message
    await provider.sendMessage({ to: ['new@example.com'], subject: 'Hello', body: 'Test' });
    const finalSync = await provider.syncMailbox();
    expect(finalSync.messages.length).toBe(4);
    expect(finalSync.messages[3].subject).toBe('Hello');
  });

  it('fails authentication at the boundary on invalid code', async () => {
    const provider: IProviderAdapter = new DemoProvider();
    await expect(provider.authenticate('invalid_code')).rejects.toThrow('Authentication failed');
  });
});
