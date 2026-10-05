import { IProviderAdapter, ProviderCredentials, SyncCursor } from './IProviderAdapter';
import { Message } from '../domain/message';

export class MockProvider implements IProviderAdapter {
  async authenticate(authCode: string): Promise<ProviderCredentials> {
    if (authCode === 'invalid_code') {
      throw new Error('Authentication failed');
    }
    return {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresAt: Date.now() + 3600000,
    };
  }

  async syncMailbox(cursor?: SyncCursor): Promise<{ messages: Message[]; nextCursor: SyncCursor }> {
    const mockMessage: Message = {
      id: 'internal-123',
      providerId: 'provider-123',
      threadId: 'thread-123',
      from: { email: 'test@example.com', name: 'Test User' },
      to: [{ email: 'me@example.com' }],
      cc: [],
      bcc: [],
      subject: 'Mock Sync',
      snippet: 'This is a mock message for testing boundaries',
      date: new Date(),
      hasAttachments: false,
    };

    return {
      messages: [mockMessage],
      nextCursor: {
        historyId: 'history-2',
        lastSync: new Date()
      }
    };
  }

  async sendMessage(payload: { to: string[]; subject: string; body: string }): Promise<void> {
    // Mock send
  }

  async mutateMessage(providerId: string, action: 'archive' | 'trash' | 'read' | 'unread'): Promise<void> {
    // Mock mutate
  }
}
