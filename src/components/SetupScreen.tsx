import React, { useState } from 'react';
import { Sparkles, ChevronRight, Hash } from 'lucide-react';
import { Mode, Level, ChatSession } from '@/types';
import { MODE_CONFIG, LEVEL_CONFIG, TOPIC_SUGGESTIONS } from '@/constants';

interface SetupScreenProps {
  onStart: (session: ChatSession) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [mode, setMode] = useState<Mode>('explanation');
  const [level, setLevel] = useState<Level>('beginner');
  const [topic, setTopic] = useState('');

  const handleStart = () => {
    if (!topic.trim()) return;
    onStart({ mode, level, topic: topic.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-5 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            AI学習支援チャットボット
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            AIエンジニア講座の復習をAIがサポートします
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-8 space-y-8">

            {/* Mode Selection */}
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                モードを選択
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => {
                  const cfg = MODE_CONFIG[m];
                  const Icon = cfg.icon;
                  const isActive = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        isActive
                          ? cfg.activeColor
                          : `bg-slate-50 ${cfg.borderColor}`
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-white shadow-sm' : 'bg-white'
                      }`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-slate-800' : 'text-slate-700'}`}>
                          {cfg.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                          {cfg.description}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                        isActive
                          ? `border-current ${cfg.color} bg-current`
                          : 'border-slate-300'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Level Selection */}
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                レベルを選択
              </h2>
              <div className="flex gap-3">
                {(Object.keys(LEVEL_CONFIG) as Level[]).map((l) => {
                  const cfg = LEVEL_CONFIG[l];
                  const isActive = level === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <p className="text-sm font-semibold">{cfg.label}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cfg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Topic Input */}
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                学びたいトピック
              </h2>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="例：プロンプトエンジニアリング"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-800 placeholder-slate-400 text-sm transition-colors bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {TOPIC_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTopic(s)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      topic === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Hash className="w-3 h-3" />
                    {s}
                  </button>
                ))}
              </div>
            </section>

          </div>

          {/* Start Button */}
          <div className="px-8 pb-8">
            <button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              チャットを開始する
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Powered by Dify &amp; React
        </p>
      </div>
    </div>
  );
}
