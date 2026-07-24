import { useCallback, useRef, useState } from 'react';
import SetupScreen from '@/components/SetupScreen';
import ChatScreen from '@/components/ChatScreen';
import { sendChatMessage } from '@/lib/dify';
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

  const handleStart = useCallback((session: ChatSession) => {
    conversationIdRef.current = '';
    setState({
      screen: 'chat',
      session,
      messages: [],
      isLoading: false,
    });
  }, []);

  const handleReset = useCallback(() => {
    conversationIdRef.current = '';
    setState(initialState);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!state.session) return;

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
        buildDifyInputs(state.session)
      );
      conversationIdRef.current = conversationId;

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        isLoading: false,
      }));
    } catch (err) {
      const content =
        err instanceof Error ? err.message : 'エラーが発生しました。もう一度お試しください。';
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isLoading: false,
      }));
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
