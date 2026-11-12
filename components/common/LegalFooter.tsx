'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale, FileText, CreditCard } from 'lucide-react';
import { LegalTab } from './LegalModal';
import AdContainer from './AdContainer';

interface LegalFooterProps {
  onOpenLegal: (tab: LegalTab) => void;
  className?: string;
  /** フッター直上の広告表示枠を表示するかどうか (デフォルト: true) */
  showAd?: boolean;
}

export default function LegalFooter({
  onOpenLegal,
  className = '',
  showAd = true,
}: LegalFooterProps) {
  return (
    <div className="w-full">
      {/* 全ページ共通のフッター直上 広告コンテナ */}
      {showAd && <AdContainer format="horizontal" className="!my-4" />}

      <footer className={`py-6 px-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-[#0C101C] ${className}`}>
        <div className="max-w-md mx-auto space-y-3">
          {/* 法務・規約リンクリスト */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-400">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 cursor-pointer"
            >
              プライバシーポリシー
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => onOpenLegal('tokusho')}
              className="hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 cursor-pointer"
            >
              特定商取引法に基づく表記
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 cursor-pointer"
            >
              利用規約
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <Link
              href="/account"
              className="inline-flex items-center gap-1 hover:text-indigo-300 text-indigo-400/90 transition-colors underline underline-offset-4 decoration-indigo-800/80 hover:decoration-indigo-400 cursor-pointer"
            >
              <CreditCard className="w-3 h-3 text-indigo-400" />
              <span>定期課金の確認・解約</span>
            </Link>
          </div>

          {/* 免責ミニテキスト */}
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
            ※本サービスは心理学モデルに基づく自己分析支援ツールであり、医療行為・確定診断を行うものではありません。
          </p>

          {/* コピーライト */}
          <p className="text-[10px] text-slate-600 font-mono">
            © 2026 ココロナビ（KokoroNavi） All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
