export type Mode = 'explanation' | 'quiz' | 'diagnosis';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface ChatSession {
  mode: Mode;
  level: Level;
  topic: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppState {
  screen: 'setup' | 'chat';
  session: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
}
