import { describe, it, expect } from 'vitest';
import { encryptProviderCredentials, decryptProviderCredentials } from '../../src/security/kms';
import { MockProvider } from '../../src/providers/mockProvider';
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

  it('mock provider authenticates and returns normalized credentials', async () => {
    const provider: IProviderAdapter = new MockProvider();
    const creds = await provider.authenticate('valid_code');
    expect(creds.accessToken).toBe('mock_access_token');
  });

  it('mock provider syncs agnostic domain messages, not provider-specific structures', async () => {
    const provider: IProviderAdapter = new MockProvider();
    const result = await provider.syncMailbox();
    
    expect(result.messages.length).toBe(1);
    const msg = result.messages[0];
    
    // Verify provider specific concepts don't leak (e.g., Gmail's 'labelIds' should not exist in the domain model)
    expect((msg as any).labelIds).toBeUndefined();
    expect(msg.providerId).toBe('provider-123');
    expect(msg.from.email).toBe('test@example.com');
  });

  it('fails authentication at the boundary on invalid code', async () => {
    const provider: IProviderAdapter = new MockProvider();
    await expect(provider.authenticate('invalid_code')).rejects.toThrow('Authentication failed');
  });
});
