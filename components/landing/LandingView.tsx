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
    <div className="min-h-screen bg-[#0C101C] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-purple-200">
      {/* --- ヘッダー --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group cursor-pointer"
          >
            <OwlMascot size={32} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  ココロナビ
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Kokoro Navi
                </span>
              </div>
              <p className="text-[10px] text-slate-400">16タイプ × メンタル・疲弊度診断</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
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

          {/* 3つの特徴ピル */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">16タイプ性格プロファイリング</p>
                <p className="text-[10px] text-slate-400">認知機能の強みと行動特性</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">やさしい対話型チャット</p>
                <p className="text-[10px] text-slate-400">途中で閉じても自動保存</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141A29]/70 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">認知の歪み＆心の疲弊度</p>
                <p className="text-[10px] text-slate-400">多角的なメンタルケア処方箋</p>
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
