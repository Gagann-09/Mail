export type AttentionState = 'New' | 'Needs action' | 'Waiting' | 'Reference' | 'Done';

export interface CommitmentState {
  messageId: string; // References internal Message UUID
  state: AttentionState;
  snoozedUntil?: Date;
  scheduledFor?: Date;
  updatedAt: Date;
}
