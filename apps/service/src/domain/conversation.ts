import { Message } from './message';

export interface Conversation {
  id: string; // Internal UUID
  messages: Message[];
  subject: string;
  updatedAt: Date;
}
