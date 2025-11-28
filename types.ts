
export interface EmailDraft {
  subject: string;
  body: string;
}

export enum SendingStatus {
  IDLE = 'IDLE',
  SENDING = 'SENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum AIStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  ERROR = 'ERROR',
}

export interface WorkerConfig {
  endpointUrl: string;
  authToken: string;
}

export type Tone = 'professional' | 'friendly' | 'urgent' | 'concise';
