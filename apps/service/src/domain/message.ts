export interface Message {
  id: string; // Internal UUID
  providerId: string; // External Provider ID
  threadId: string; // Associated Thread/Conversation UUID
  from: Contact;
  to: Contact[];
  cc: Contact[];
  bcc: Contact[];
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

export interface Contact {
  name?: string;
  email: string;
}
