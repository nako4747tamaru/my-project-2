'use client';

import React, { useState, useEffect } from 'react';
import ChatDiagnosticScreen from '../components/chat/ChatDiagnosticScreen';
import ResultScreen from '../components/result/ResultScreen';
import { Answers } from '../lib/personality';

export default function Home() {
  const [viewMode, setViewMode] = useState<'chat' | 'result'>('result');
  const [userAnswers, setUserAnswers] = useState<Answers | undefined>(undefined);
  const [userName, setUserName] = useState<string>('たか');

  // クライアント側で保存された進捗やニックネームを確認
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('kokoro_navi_answers_v2');
      const savedName = localStorage.getItem('kokoro_navi_nickname_v2');
      if (savedName) setUserName(savedName);
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        if (Object.keys(parsed).length >= 100) {
          setUserAnswers(parsed);
          setViewMode('result');
          return;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 100問回答完了時
  const handleComplete = (answers: Answers, nickname: string) => {
    setUserAnswers(answers);
    setUserName(nickname || 'たか');
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 再診断（チャットに戻る）
  const handleRetest = () => {
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // サンプルプレビュー（結果画面を見る）
  const handlePreviewSample = () => {
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#0C101C]">
      {viewMode === 'chat' ? (
        <ChatDiagnosticScreen
          onComplete={handleComplete}
          onPreviewSample={handlePreviewSample}
        />
      ) : (
        <ResultScreen
          userName={userName}
          answers={userAnswers}
          onRetest={handleRetest}
        />
      )}
    </main>
  );
}
