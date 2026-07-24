import { Mode, Level } from '@/types';
import {
  BookOpen,
  BrainCircuit,
  Activity,
} from 'lucide-react';

export const MODE_CONFIG: Record<Mode, {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  borderColor: string;
}> = {
  explanation: {
    label: '概念解説',
    description: 'トピックをレベルに合わせてわかりやすく解説します',
    icon: BookOpen,
    color: 'text-blue-600',
    activeColor: 'bg-blue-50 border-blue-500',
    borderColor: 'border-blue-200 hover:border-blue-400',
  },
  quiz: {
    label: '理解度クイズ',
    description: '問題を出題し、回答後に採点・解説をします',
    icon: BrainCircuit,
    color: 'text-emerald-600',
    activeColor: 'bg-emerald-50 border-emerald-500',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
  },
  diagnosis: {
    label: '弱点診断',
    description: '会話から理解が浅い部分を診断・指摘します',
    icon: Activity,
    color: 'text-amber-600',
    activeColor: 'bg-amber-50 border-amber-500',
    borderColor: 'border-amber-200 hover:border-amber-400',
  },
};

export const LEVEL_CONFIG: Record<Level, {
  label: string;
  description: string;
}> = {
  beginner: {
    label: '初級',
    description: '基礎から丁寧に',
  },
  intermediate: {
    label: '中級',
    description: '実践的な内容を中心に',
  },
  advanced: {
    label: '上級',
    description: '深い理解と応用まで',
  },
};

export const TOPIC_SUGGESTIONS = [
  'プロンプトエンジニアリング',
  'RAG（検索拡張生成）',
  'ファインチューニング',
  'エージェント設計',
  'ベクトルデータベース',
  'LLMの仕組み',
  'Dify の使い方',
  'APIの活用方法',
];
