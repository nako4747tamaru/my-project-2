'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResultScreen from '../../components/result/ResultScreen';
import { Answers } from '../../lib/personality';
import { QUESTIONS as defaultQuestions } from '../../lib/questions';
import { resetDiagnosticSession } from '../../lib/session';

export default function ResultClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type')?.toUpperCase();
  const nameParam = searchParams.get('name') || 'ゲスト';

  const [answers, setAnswers] = useState<Answers | undefined>(undefined);
  const [userName, setUserName] = useState<string>(nameParam);

  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('kokoro_navi_answers_v2');
      const savedName = localStorage.getItem('kokoro_navi_nickname_v2');
      if (savedName && !searchParams.get('name')) {
        setUserName(savedName);
      }
      if (savedAnswers && !typeParam) {
        const parsed = JSON.parse(savedAnswers);
        if (Object.keys(parsed).length >= 100) {
          setAnswers(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // typeParam が指定されている場合（例: ?type=ENFJ でペンギン表示確認）はそのタイプの回答を動的生成
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
      setAnswers(customSample);
    }
  }, [typeParam, searchParams]);

  return (
    <main className="min-h-screen bg-[#0C101C]">
      <ResultScreen
        userName={userName}
        answers={answers}
        initialType={typeParam}
        onRetest={() => {
          resetDiagnosticSession();
          router.push('/?mode=chat');
        }}
        onBackToHome={() => router.push('/')}
      />
    </main>
  );
}
