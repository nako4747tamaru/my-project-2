'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LandingView from '../components/landing/LandingView';
import ChatDiagnosticScreen from '../components/chat/ChatDiagnosticScreen';
import ResultScreen from '../components/result/ResultScreen';
import { Answers } from '../lib/personality';
import { QUESTIONS as defaultQuestions } from '../lib/questions';
import { resetDiagnosticSession } from '../lib/session';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type')?.toUpperCase();
  const modeParam = searchParams.get('mode');

  // 初期ビューモード:
  // - mode=chat: 診断チャット画面
  // - mode=result: 結果画面
  // - typeParam指定時: そのタイプの結果画面
  // - それ以外: ランディングトップ画面 ('landing')
  const [viewMode, setViewMode] = useState<'landing' | 'chat' | 'result'>('landing');
  const [userAnswers, setUserAnswers] = useState<Answers | undefined>(undefined);
  const [userName, setUserName] = useState<string>('ゲスト');
  const [hasResumeData, setHasResumeData] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);

  // 保存データの確認
  useEffect(() => {
    // リセットモード（?mode=chat&reset=true）の場合は、確実にローカルストレージとステートを空にする
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      resetDiagnosticSession();
      setUserAnswers(undefined);
      setUserName('ゲスト');
      setHasResumeData(false);
      setResumeIndex(0);
      setViewMode('chat');
      return;
    }

    try {
      const savedAnswers = localStorage.getItem('kokoro_navi_answers_v2');
      const savedName = localStorage.getItem('kokoro_navi_nickname_v2');
      const savedIdx = localStorage.getItem('kokoro_navi_current_index_v2');

      if (savedName) setUserName(savedName);

      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        const count = Object.keys(parsed).length;
        if (count >= 100 && !modeParam && !typeParam) {
          // 100問完了データがある場合はユーザーの履歴保持として記憶
          setUserAnswers(parsed);
          setHasResumeData(true);
        } else if (count > 0) {
          setHasResumeData(true);
          setResumeIndex(savedIdx ? parseInt(savedIdx, 10) : count);
        }
      }
    } catch {
      // ignore
    }

    if (modeParam === 'chat') {
      setViewMode('chat');
    } else if (modeParam === 'result') {
      setViewMode('result');
    } else if (typeParam) {
      // typeクエリパラメータ（例: ?type=ENFJ でペンギン確認）指定時の動的回答生成
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
    } else {
      setViewMode('landing');
    }
  }, [typeParam, modeParam]);

  // 診断開始（チャット画面へ切り替え）
  const handleStartDiagnosis = () => {
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 100問回答完了時（結果画面へ切り替え）
  const handleComplete = (answers: Answers, nickname: string) => {
    setUserAnswers(answers);
    setUserName(nickname || 'ゲスト');
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 再診断（チャットへ切り替え）
  const handleRetest = () => {
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // サンプルプレビュー（結果画面を見る）
  const handlePreviewSample = () => {
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 特定タイプのサンプルプレビュー
  const handlePreviewType = (typeCode: string) => {
    const customSample: Answers = {};
    defaultQuestions.forEach((q, idx) => {
      const key = q.id ?? idx + 1;
      let val = 3;
      if (q.dim === 'EI') val = typeCode.includes('E') ? (q.pole === 'E' ? 5 : 1) : (q.pole === 'I' ? 5 : 1);
      else if (q.dim === 'SN') val = typeCode.includes('S') ? (q.pole === 'S' ? 5 : 1) : (q.pole === 'N' ? 5 : 1);
      else if (q.dim === 'TF') val = typeCode.includes('T') ? (q.pole === 'T' ? 5 : 1) : (q.pole === 'F' ? 5 : 1);
      else if (q.dim === 'JP') val = typeCode.includes('J') ? (q.pole === 'J' ? 5 : 1) : (q.pole === 'P' ? 5 : 1);
      else if (q.dim === 'fatigue') val = 3;
      else val = 3;
      customSample[key] = val;
      customSample[idx] = val;
    });
    setUserAnswers(customSample);
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // トップ（ランディング面）に戻る
  const handleBackToLanding = () => {
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 診断データを初期化して最初から受ける
  const handleResetAndStart = () => {
    resetDiagnosticSession();
    setUserAnswers(undefined);
    setHasResumeData(false);
    setResumeIndex(0);
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#0C101C]">
      {viewMode === 'landing' && (
        <LandingView
          onStartDiagnosis={handleStartDiagnosis}
          onPreviewType={handlePreviewType}
          onResetAndStart={handleResetAndStart}
          hasResumeData={hasResumeData}
          resumeIndex={resumeIndex}
          userName={userName}
        />
      )}

      {viewMode === 'chat' && (
        <ChatDiagnosticScreen
          onComplete={handleComplete}
          onPreviewSample={handlePreviewSample}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {viewMode === 'result' && (
        <ResultScreen
          userName={userName}
          answers={userAnswers}
          initialType={typeParam}
          onRetest={handleResetAndStart}
          onBackToHome={handleBackToLanding}
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
