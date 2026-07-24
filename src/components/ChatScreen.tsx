import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  RotateCcw,
  Settings2,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Message, ChatSession } from '@/types';
import { MODE_CONFIG, LEVEL_CONFIG } from '@/constants';
import { getQuizStats } from '@/lib/storage';

interface ChatScreenProps {
  session: ChatSession;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onReset: () => void;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
        }`}>
          {message.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-slate-400">
            {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
            >
              {copied
                ? <Check className="w-3 h-3 text-emerald-500" />
                : <Copy className="w-3 h-3 text-slate-400" />
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatScreen({
  session,
  messages,
  isLoading,
  onSendMessage,
  onReset,
}: ChatScreenProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeConfig = MODE_CONFIG[session.mode];
  const ModeIcon = modeConfig.icon;
  const quizStats = session.mode === 'quiz' ? getQuizStats(session.topic) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-blue-500/30">
              <ModeIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-800">
                  {modeConfig.label}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {LEVEL_CONFIG[session.level].label}
                </span>
                {quizStats && quizStats.total > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                    正答率 {quizStats.correct}/{quizStats.total}（{Math.round((quizStats.correct / quizStats.total) * 100)}%）
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                #{session.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            設定変更
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <ModeIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">
                {modeConfig.label}モードで開始しました
              </h2>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-1">
                トピック：<span className="font-medium text-slate-700">{session.topic}</span>
              </p>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                {modeConfig.description}
              </p>
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 px-5 py-4 max-w-sm text-left shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">はじめ方</p>
                <ul className="space-y-1.5">
                  <StartHint mode={session.mode} topic={session.topic} />
                </ul>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-all px-4 py-3 shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力… (Shift+Enterで改行)"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder-slate-400 leading-relaxed"
              style={{ minHeight: '24px', maxHeight: '160px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            AIの回答には誤りが含まれる場合があります。重要な情報は必ず確認してください。
          </p>
        </div>
      </footer>
    </div>
  );
}

function StartHint({ mode, topic }: { mode: ChatSession['mode']; topic: string }) {
  const hints: Record<ChatSession['mode'], string[]> = {
    explanation: [
      `「${topic}について教えてください」と入力してみましょう`,
      'わからない点はどんどん質問できます',
      '各回答の最後にクイズが出されます',
    ],
    quiz: [
      `「${topic}のクイズを出してください」と入力してみましょう`,
      '答えを送ると採点・解説をしてくれます',
      '難易度を指定することもできます',
    ],
    diagnosis: [
      `「${topic}について質問してみます」と入力してスタート`,
      '会話を重ねると弱点を診断してくれます',
      '「弱点を診断して」と明示的に依頼もできます',
    ],
  };

  return (
    <>
      {hints[mode].map((hint, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
          <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center flex-shrink-0 text-[10px]">
            {i + 1}
          </span>
          {hint}
        </li>
      ))}
    </>
  );
}
