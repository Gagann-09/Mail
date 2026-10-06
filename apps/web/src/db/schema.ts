import Dexie, { Table } from 'dexie';

export interface LocalMessage {
  id: string;
  providerId: string;
  threadId: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  subject: string;
  snippet: string;
  date: Date;
  hasAttachments: boolean;
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
