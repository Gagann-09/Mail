import { Message } from '../domain/message';

export interface ProviderCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface SyncCursor {
  historyId: string;
  lastSync: Date;
}

export interface IProviderAdapter {
  /**
   * Authenticates with the provider using raw credentials (e.g. OAuth code).
   * Returns standardized, refreshable tokens.
   */
  authenticate(authCode: string): Promise<ProviderCredentials>;

  /**
   * Synchronizes the mailbox starting from the given cursor.
   * Translates provider-specific concepts (labels, folders) into agnostic Message/Conversation models.
   */
  syncMailbox(cursor?: SyncCursor): Promise<{
    messages: Message[];
    nextCursor: SyncCursor;
  }>;

  /**
   * Sends a new email through the provider.
   */
  sendMessage(payload: { to: string[]; subject: string; body: string; threadId?: string }): Promise<void>;

  /**
   * Mutates a message's state on the provider side (e.g., mark read, archive).
   * Note: The adapter must map our abstract 'action' to the provider's specific label/folder mechanisms.
   */
  mutateMessage(providerId: string, action: 'archive' | 'trash' | 'read' | 'unread'): Promise<void>;
}
