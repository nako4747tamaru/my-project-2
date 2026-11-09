'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatDiagnosticScreen from '../components/chat/ChatDiagnosticScreen';
import ResultScreen from '../components/result/ResultScreen';
import { Answers } from '../lib/personality';
import { QUESTIONS as defaultQuestions } from '../lib/questions';

function HomeContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type')?.toUpperCase();
  const modeParam = searchParams.get('mode');

  const [viewMode, setViewMode] = useState<'chat' | 'result'>(
    modeParam === 'chat' ? 'chat' : 'result'
  );
  const [userAnswers, setUserAnswers] = useState<Answers | undefined>(undefined);
  const [userName, setUserName] = useState<string>('たか');

  // クライアント側で保存された進捗やニックネームを確認
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('kokoro_navi_answers_v2');
      const savedName = localStorage.getItem('kokoro_navi_nickname_v2');
      if (savedName) setUserName(savedName);
      if (savedAnswers && !typeParam) {
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

    // typeクエリパラメータ（例: ?type=ENFJ でペンギン確認）指定時の動的回答生成
    if (typeParam) {
      const customSample: Answers = {};
      defaultQuestions.forEach((q, idx) => {
        const key = q.id ?? idx + 1;
        let val = 3;
        if (q.dim === 'EI') val = typeParam.includes('E') ? (q.pole === 'E' ? 5 : 1) : (q.pole === 'I' ? 5 : 1);
        else if (q.dim === 'SN') val = typeParam.includes('S') ? (q.pole === 'S' ? 5 : 1) : (q.pole === 'N' ? 5 : 1);
        else if (q.dim === 'TF') val = typeParam.includes('T') ? (q.pole === 'T' ? 5 : 1) : (q.pole === 'F' ? 5 : 1);
        else if (q.dim === 'JP') val = typeParam.includes('J') ? (q.pole === 'J' ? 5 : 1) : (q.pole === 'P' ? 5 : 1);
        else if (q.dim === 'fatigue') val = 3;
        else val = 3;
        customSample[key] = val;
        customSample[idx] = val;
      });
      setUserAnswers(customSample);
      setViewMode('result');
    }
  }, [typeParam]);

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

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C101C] text-white flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
