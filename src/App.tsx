import { useCallback, useEffect, useRef, useState } from 'react';
import SetupScreen from '@/components/SetupScreen';
import ChatScreen from '@/components/ChatScreen';
import { sendChatMessage } from '@/lib/dify';
import {
  clearChatState,
  detectQuizResult,
  loadChatState,
  recordQuizResult,
  saveChatState,
} from '@/lib/storage';
import { AppState, ChatSession, Message } from '@/types';

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

// Dify アプリ側の入力変数 (mode / level / topic) が受け付ける選択肢に合わせた変換
const DIFY_MODE_LABEL: Record<ChatSession['mode'], string> = {
  explanation: '概念解説',
  quiz: 'クイズ',
  diagnosis: '弱点診断',
};

const DIFY_LEVEL_LABEL: Record<ChatSession['level'], string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

function buildDifyInputs(session: ChatSession): Record<string, string> {
  return {
    mode: DIFY_MODE_LABEL[session.mode],
    level: DIFY_LEVEL_LABEL[session.level],
    topic: session.topic,
  };
}

const initialState: AppState = {
  screen: 'setup',
  session: null,
  messages: [],
  isLoading: false,
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const conversationIdRef = useRef('');

  useEffect(() => {
    const restored = loadChatState();
    if (restored) {
      conversationIdRef.current = restored.conversationId;
      setState({
        screen: 'chat',
        session: restored.session,
        messages: restored.messages,
        isLoading: false,
      });
    }
  }, []);

  const handleStart = useCallback((session: ChatSession) => {
    conversationIdRef.current = '';
    clearChatState();
    setState({
      screen: 'chat',
      session,
      messages: [],
      isLoading: false,
    });
  }, []);

  const handleReset = useCallback(() => {
    conversationIdRef.current = '';
    clearChatState();
    setState(initialState);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!state.session) return;
    const session = state.session;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
    }));

    try {
      const { answer, conversationId } = await sendChatMessage(
        text,
        conversationIdRef.current,
        buildDifyInputs(session)
      );
      conversationIdRef.current = conversationId;

      if (session.mode === 'quiz') {
        const result = detectQuizResult(answer);
        if (result !== null) recordQuizResult(session.topic, result);
      }

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      setState((prev) => {
        const messages = [...prev.messages, assistantMsg];
        saveChatState(session, messages, conversationIdRef.current);
        return { ...prev, messages, isLoading: false };
      });
    } catch (err) {
      const content =
        err instanceof Error ? err.message : 'エラーが発生しました。もう一度お試しください。';
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setState((prev) => {
        const messages = [...prev.messages, errorMsg];
        saveChatState(session, messages, conversationIdRef.current);
        return { ...prev, messages, isLoading: false };
      });
    }
  }, [state.session]);

  if (state.screen === 'chat' && state.session) {
    return (
      <ChatScreen
        session={state.session}
        messages={state.messages}
        isLoading={state.isLoading}
        onSendMessage={handleSendMessage}
        onReset={handleReset}
      />
    );
  }

  return <SetupScreen onStart={handleStart} />;
}
