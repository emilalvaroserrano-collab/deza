export enum SpeakerRole {
  USER = 'USER',
  CLIENT = 'CLIENT',
  AI = 'AI'
}

export interface TranscriptLine {
  id: string;
  role: SpeakerRole;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface SuggestedAnswer {
  short: string;
  detailed: string;
  confidence: number;
  source?: string;
}

export interface AnticipatedQuestion {
  id: string;
  question: string;
}

export enum AppMode {
  DESKTOP = 'DESKTOP',
  COPILOT_COMPACT = 'COPILOT_COMPACT',
  COPILOT_EXPANDED = 'COPILOT_EXPANDED',
  TUTOR = 'TUTOR',
  AUTONOMOUS = 'AUTONOMOUS'
}

export interface TaskStep {
  id: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface AutonomousPlan {
  goal: string;
  steps: TaskStep[];
}
