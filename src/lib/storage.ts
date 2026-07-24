import { ChatSession, Message } from '@/types';

const STATE_KEY = 'chat_state_v1';
const QUIZ_STATS_KEY = 'quiz_stats_v1';

interface PersistedState {
  session: ChatSession;
  messages: (Omit<Message, 'timestamp'> & { timestamp: string })[];
  conversationId: string;
}

export interface RestoredChatState {
  session: ChatSession;
  messages: Message[];
  conversationId: string;
}

export function saveChatState(session: ChatSession, messages: Message[], conversationId: string) {
  const payload: PersistedState = {
    session,
    messages: messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })),
    conversationId,
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(payload));
}

export function loadChatState(): RestoredChatState | null {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return null;
  try {
    const parsed: PersistedState = JSON.parse(raw);
    return {
      session: parsed.session,
      messages: parsed.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
      conversationId: parsed.conversationId,
    };
  } catch {
    return null;
  }
}

export function clearChatState() {
  localStorage.removeItem(STATE_KEY);
}

interface QuizStat {
  correct: number;
  total: number;
}

function getAllQuizStats(): Record<string, QuizStat> {
  const raw = localStorage.getItem(QUIZ_STATS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function recordQuizResult(topic: string, correct: boolean) {
  const stats = getAllQuizStats();
  const prev = stats[topic] ?? { correct: 0, total: 0 };
  stats[topic] = { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 };
  localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
}

export function getQuizStats(topic: string): QuizStat | null {
  return getAllQuizStats()[topic] ?? null;
}

// Dify 側のクイズ採点メッセージに含まれるキーワードから正誤を推定する
export function detectQuizResult(answer: string): boolean | null {
  if (answer.includes('不正解')) return false;
  if (answer.includes('正解')) return true;
  return null;
}
