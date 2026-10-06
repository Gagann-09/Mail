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
  hasAttachments: boolean;
  attachments?: Attachment[];
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
