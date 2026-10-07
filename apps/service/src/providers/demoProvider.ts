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
        labels: ['INBOX'],
        hasAttachments: false,
      },
      {
        id: 'msg-1-reply',
        providerId: 'demo-prov-1-reply',
        threadId: 'thread-1',
        from: { name: 'Me', email: 'me@mail.local' },
        to: [{ email: 'alice@example.com' }],
        cc: [],
        bcc: [],
        subject: 'Re: Welcome to the Demo!',
        snippet: 'Thanks Alice, glad to be here!',
        bodyHtml: '<p>Thanks Alice, glad to be here!</p>',
        date: new Date(Date.now() - 1000 * 60 * 50), // 50 mins ago
        labels: ['INBOX', 'WAITING'],
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
        labels: ['INBOX', 'LATER'],
        hasAttachments: true,
        attachments: [
          {
            id: 'att-1',
            filename: 'Verification_Guide.pdf',
            contentType: 'application/pdf',
            size: 153600, // 150KB
            url: '#mock-url-1',
          },
          {
            id: 'att-2',
            filename: 'logo.png',
            contentType: 'image/png',
            size: 45000,
            url: '#mock-url-2',
          }
        ]
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

  async sendMessage(payload: { to: string[]; subject: string; body: string; threadId?: string }): Promise<void> {
    const newMsg: Message = {
      id: `msg-sent-${Date.now()}`,
      providerId: `demo-prov-${Date.now()}`,
      threadId: payload.threadId || `thread-sent-${Date.now()}`,
      from: { email: 'me@mail.local' },
      to: payload.to.map(email => ({ email })),
      cc: [],
      bcc: [],
      subject: payload.subject,
      snippet: payload.body.substring(0, 100),
      date: new Date(),
      labels: ['INBOX', 'SENT'],
      hasAttachments: false,
    };
    this.inMemoryMessages.push(newMsg);
    this.historyCounter++;
  }

  async mutateMessage(providerId: string, action: 'archive' | 'trash' | 'spam' | 'read' | 'unread' | 'waiting' | 'remove_waiting' | 'later' | 'remove_later'): Promise<void> {
    const msgIndex = this.inMemoryMessages.findIndex(m => m.providerId === providerId);
    if (msgIndex === -1) {
      throw new Error('Message not found on provider');
    }
    
    const msg = this.inMemoryMessages[msgIndex];
    msg.labels = msg.labels || [];

    if (action === 'archive') {
      msg.labels = msg.labels.filter(l => l !== 'INBOX');
      if (!msg.labels.includes('ARCHIVE')) {
        msg.labels.push('ARCHIVE');
      }
    } else if (action === 'trash') {
      msg.labels = msg.labels.filter(l => l !== 'INBOX' && l !== 'ARCHIVE' && l !== 'SPAM');
      if (!msg.labels.includes('TRASH')) {
        msg.labels.push('TRASH');
      }
    } else if (action === 'spam') {
      msg.labels = msg.labels.filter(l => l !== 'INBOX' && l !== 'ARCHIVE' && l !== 'TRASH');
      if (!msg.labels.includes('SPAM')) {
        msg.labels.push('SPAM');
      }
    } else if (action === 'waiting') {
      if (!msg.labels.includes('WAITING')) {
        msg.labels.push('WAITING');
      }
    } else if (action === 'remove_waiting') {
      msg.labels = msg.labels.filter(l => l !== 'WAITING');
    } else if (action === 'later') {
      if (!msg.labels.includes('LATER')) {
        msg.labels.push('LATER');
      }
    } else if (action === 'remove_later') {
      msg.labels = msg.labels.filter(l => l !== 'LATER');
    }
    
    this.historyCounter++;
  }
}
