import { IProviderAdapter, ProviderCredentials, SyncCursor } from './IProviderAdapter';
import { Message } from '../domain/message';

/**
 * DemoProvider serves as a fully in-memory, fake email provider.
 * It simulates authentication, syncing, and mutating emails for the purpose of
 * UI development and testing without requiring a real IMAP/OAuth connection.
 */
export class DemoProvider implements IProviderAdapter {
  private inMemoryMessages: Message[] = [];
  private historyCounter = 1;

  constructor() {
    this.seedMessages();
  }

  private seedMessages() {
    this.inMemoryMessages = [
      {
        id: 'msg-1',
        providerId: 'demo-prov-1',
        threadId: 'thread-1',
        from: { name: 'Alice', email: 'alice@example.com' },
        to: [{ email: 'me@mail.local' }],
        cc: [],
        bcc: [],
        subject: 'Welcome to the Demo!',
        snippet: 'This is the first seeded message in the demo provider.',
        bodyHtml: '<p>Hello!</p><p>This is the <b>first seeded message</b> in the demo provider.</p>',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        hasAttachments: false,
      },
      {
        id: 'msg-2',
        providerId: 'demo-prov-2',
        threadId: 'thread-2',
        from: { name: 'Bob', email: 'bob@example.com' },
        to: [{ email: 'me@mail.local' }],
        cc: [],
        bcc: [],
        subject: 'Action Required: Verify Account',
        snippet: 'Please click the link below to verify your account.',
        bodyHtml: '<p>Please click the link below to verify your account.</p><a href="#">Verify Now</a>',
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        hasAttachments: true,
      },
    ];
  }

  async authenticate(authCode: string): Promise<ProviderCredentials> {
    if (authCode === 'invalid_code') {
      throw new Error('Authentication failed');
    }
    return {
      accessToken: 'demo_access_token',
      refreshToken: 'demo_refresh_token',
      expiresAt: Date.now() + 3600000,
    };
  }

  async syncMailbox(cursor?: SyncCursor): Promise<{ messages: Message[]; nextCursor: SyncCursor }> {
    // In a real provider, we would fetch only messages newer than the cursor.
    // For demo, we just return the in-memory array if there's no cursor, or empty if synced.
    
    const isNewSync = !cursor;
    const messagesToReturn = isNewSync ? [...this.inMemoryMessages] : [];
    
    this.historyCounter++;
    
    return {
      messages: messagesToReturn,
      nextCursor: {
        historyId: `history-${this.historyCounter}`,
        lastSync: new Date()
      }
    };
  }

  async sendMessage(payload: { to: string[]; subject: string; body: string }): Promise<void> {
    const newMsg: Message = {
      id: `msg-sent-${Date.now()}`,
      providerId: `demo-prov-${Date.now()}`,
      threadId: `thread-sent-${Date.now()}`,
      from: { email: 'me@mail.local' },
      to: payload.to.map(email => ({ email })),
      cc: [],
      bcc: [],
      subject: payload.subject,
      snippet: payload.body.substring(0, 100),
      date: new Date(),
      hasAttachments: false,
    };
    this.inMemoryMessages.push(newMsg);
    this.historyCounter++;
  }

  async mutateMessage(providerId: string, action: 'archive' | 'trash' | 'read' | 'unread'): Promise<void> {
    const msgIndex = this.inMemoryMessages.findIndex(m => m.providerId === providerId);
    if (msgIndex === -1) {
      throw new Error('Message not found on provider');
    }
    
    // In a real provider, this might move the email to a different folder or apply a label.
    // In our mock, if action is trash, we remove it from sync scope.
    if (action === 'trash') {
      this.inMemoryMessages.splice(msgIndex, 1);
    }
    
    this.historyCounter++;
  }
}
