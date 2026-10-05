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
  date: Date;
  hasAttachments: boolean;
}

export interface Contact {
  name?: string;
  email: string;
}
