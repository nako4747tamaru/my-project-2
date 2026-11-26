'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Brain,
  Search,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';
import OwlMascot from '../common/OwlMascot';
import LegalFooter from '../common/LegalFooter';
import LegalModal, { LegalTab } from '../common/LegalModal';
import TypeLandingSection from './TypeLandingSection';
import MethodologySection from './MethodologySection';
import FaqSection from './FaqSection';
import ThemeToggle from '../theme/ThemeToggle';

interface LandingViewProps {
  onStartDiagnosis: () => void;
  onPreviewType?: (typeCode: string) => void;
  onResetAndStart?: () => void;
  hasResumeData?: boolean;
  resumeIndex?: number;
  userName?: string;
}

export default function LandingView({
  onStartDiagnosis,
  onPreviewType,
  onResetAndStart,
  hasResumeData,
  resumeIndex = 0,
  userName = '',
}: LandingViewProps) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-purple-200 relative overflow-hidden">
      {/* --- ライトモード用：グラデーション水玉アクセント（ソフトで優しい円形グラデーション） --- */}
      <div className="hidden light-dots-layer pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* パステルピンク水玉（右上） */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-pink-300/35 via-rose-200/25 to-transparent blur-3xl" />
        {/* パステルグリーン水玉（左中盤） */}
        <div className="absolute top-1/4 -left-20 w-88 h-88 rounded-full bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent blur-3xl" />
        {/* パステルイエロー水玉（右中盤） */}
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-amber-200/30 via-yellow-100/20 to-transparent blur-3xl" />
        {/* ペールブルー・グリーン水玉（左下） */}
        <div className="absolute bottom-1/4 -left-16 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/25 via-emerald-100/20 to-transparent blur-3xl" />
        {/* パステルピンク水玉（右下フッター付近） */}
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-t from-pink-200/30 via-rose-100/15 to-transparent blur-3xl" />
      </div>

      {/* --- ヘッダー --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group cursor-pointer"
          >
            <OwlMascot size={34} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  ココロナビ 16タイプ診断
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Kokoro Navi
                </span>
              </div>
              <p className="text-[10px] text-slate-400">100問の精密性格分析 × メンタル疲弊度チェック</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/account"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>マイページ</span>
            </Link>

            <button
              onClick={onStartDiagnosis}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-950 flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{hasResumeData ? '続きから再開' : '診断を始める'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- メインコンテンツ --- */}
      <main className="flex-1 w-full space-y-10 pb-16">
        {/* ヒーローセクション */}
        <div className="max-w-4xl mx-auto px-4 pt-8 sm:pt-12 text-center space-y-5 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>100の問いから紡ぎ出された、あなたの心の地図</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            本当のあなたに出会う<br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              16タイプ精密性格診断
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            MBTI性格特性だけでなく、現在の「心の疲弊度」や「無意識の思考の癖」まで詳細に分析。
            知恵のフクロウ「ミネルヴァ」があなたの心に寄り添い、優しくナビゲートします。
          </p>

          {/* CTAボタングループ */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartDiagnosis}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-950/60 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{hasResumeData ? `前回の続き（${resumeIndex + 1}問目〜）から再開` : '今すぐ診断を始める（無料）'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hasResumeData && onResetAndStart && (
              <button
                onClick={onResetAndStart}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#141A29] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="前回のデータを初期化して最初から受ける"
              >
                <span>最初からやり直す（リセット）</span>
              </button>
            )}

            <Link
              href="/result"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#141A29] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>診断結果サンプルの見本を見る</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3つの特徴ピル（水彩パステルトーン：グリーン・イエロー・ピンク） */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 dark:bg-[#141A29]/70 border border-slate-800 dark:border-slate-800 flex items-center gap-3 feature-card-green transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 dark:text-emerald-400 flex items-center justify-center shrink-0 feature-icon-green">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white dark:text-white feature-title">16タイプ性格プロファイリング</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 feature-desc">認知機能の強みと行動特性</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 dark:bg-[#141A29]/70 border border-slate-800 dark:border-slate-800 flex items-center gap-3 feature-card-yellow transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 dark:text-amber-400 flex items-center justify-center shrink-0 feature-icon-yellow">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white dark:text-white feature-title">やさしい対話型チャット</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 feature-desc">途中で閉じても自動保存</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 dark:bg-[#141A29]/70 border border-slate-800 dark:border-slate-800 flex items-center gap-3 feature-card-pink transition-all">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 dark:text-pink-400 flex items-center justify-center shrink-0 feature-icon-pink">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white dark:text-white feature-title">認知の歪み＆心の疲弊度</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 feature-desc">多角的なメンタルケア処方箋</p>
              </div>
            </div>
          </div>
        </div>

        {/* 16タイプ別紹介セクション */}
        <div className="w-full border-t border-slate-800/80 pt-6">
          <TypeLandingSection
            onStartDiagnosis={onStartDiagnosis}
            onPreviewType={onPreviewType}
          />
        </div>

        {/* 心理学アプローチ・3本柱とミネルヴァの役割 */}
        <div className="w-full border-t border-slate-800/80 pt-6">
          <MethodologySection />
        </div>

        {/* よくある質問（FAQ） */}
        <div className="w-full border-t border-slate-800/80 pt-6">
          <FaqSection />
        </div>
      </main>

      {/* 法務フッター */}
      <LegalFooter onOpenLegal={handleOpenLegal} />

      {/* 法務モーダル */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
