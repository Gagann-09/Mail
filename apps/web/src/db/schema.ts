import Dexie, { Table } from 'dexie';

export interface LocalMessage {
  id: string;
  providerId: string;
  threadId: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  subject: string;
  snippet: string;
  bodyHtml?: string;
  date: Date;
  labels?: string[];
  hasAttachments: boolean;
  attachments?: Attachment[];
  category?: 'personal' | 'newsletter' | 'notification' | 'transactional';
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

export class MailDatabase extends Dexie {
  messages!: Table<LocalMessage, string>;

  constructor() {
    super('MailDB');
    this.version(1).stores({
      messages: 'id, threadId, date'
    });
  }
}

export const db = new MailDatabase();
