'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Mail,
  Sparkles,
  AlertCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import OwlMascot from '../../components/common/OwlMascot';
import LegalFooter from '../../components/common/LegalFooter';
import LegalModal, { LegalTab } from '../../components/common/LegalModal';

function AccountContent() {
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 法務モーダル状態
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  useEffect(() => {
    try {
      const storedUnlocked = localStorage.getItem('kokoro_navi_premium_unlocked_v1') === 'true';
      setIsUnlocked(storedUnlocked);

      const storedCustomerId = localStorage.getItem('kokoro_navi_stripe_customer_id');
      if (storedCustomerId) setCustomerId(storedCustomerId);

      const storedEmail = localStorage.getItem('kokoro_navi_stripe_customer_email');
      if (storedEmail) {
        setCustomerEmail(storedEmail);
        setEmailInput(storedEmail);
      }

      const storedSessionId = localStorage.getItem('kokoro_navi_stripe_session_id');
      if (storedSessionId) setSessionId(storedSessionId);

      // クエリパラメータのチェック
      const urlSessionId = searchParams.get('session_id');
      if (urlSessionId) {
        setSessionId(urlSessionId);
        localStorage.setItem('kokoro_navi_stripe_session_id', urlSessionId);
      }

      if (searchParams.get('portal') === 'demo') {
        setStatusMessage('ℹ️ 開発・テスト環境のため、ポータル遷移はデモ完了として処理されました。');
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Stripe カスタマーポータル（解約・プラン管理・領収書確認）を開く
  const handleOpenCustomerPortal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoadingPortal(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const targetEmail = emailInput.trim() || customerEmail || undefined;
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || undefined,
          sessionId: sessionId || undefined,
          customerEmail: targetEmail,
          returnPath: '/account',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'カスタマーポータルの起動に失敗しました。');
      }

      // Stripeの安全なカスタマーポータル（公式管理・解約画面）へリダイレクト
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Portal open error:', err);
      setErrorMessage(
        err.message ||
          'カスタマーポータルへの接続に失敗しました。ご登録メールアドレスをご確認の上、再試行してください。'
      );
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 font-sans pb-16 selection:bg-purple-900 selection:text-purple-200">
      {/* --- ヘッダー --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/result"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>診断結果へ戻る</span>
          </Link>

          <div className="flex items-center gap-2">
            <OwlMascot size={26} />
            <span className="text-sm font-bold text-white tracking-wide">マイページ & 設定</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* タイトル */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>ご契約・定期課金（サブスクリプション）の管理</span>
          </h1>
          <p className="text-xs text-slate-400">
            ココロナビ月額会員の確認・解約・お支払いカードの変更・領収書発行
          </p>
        </div>

        {/* ステータスメッセージ / エラーメッセージ */}
        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{statusMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* 会員ステータスカード */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#182033] to-[#121726] border border-slate-700/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">現在のステータス</span>
            </div>
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                プレミアム会員（解放中）
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                無料プラン
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">プラン名:</span>
              <span className="font-semibold text-white">ココロナビ 完全レポート解放（月額会員）</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">月額料金:</span>
              <span className="font-semibold text-white">¥980 / 月（税込）</span>
            </div>
            {customerEmail && (
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">登録メールアドレス:</span>
                <span className="font-mono text-slate-200">{customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">解約制限:</span>
              <span className="text-emerald-400 font-medium">契約期間の縛りなし・いつでも即時解約可能</span>
            </div>
          </div>

          {/* Stripeカスタマーポータル遷移ボタン */}
          <div className="pt-2">
            <button
              onClick={() => handleOpenCustomerPortal()}
              disabled={isLoadingPortal}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl transition-all duration-300 group-hover:scale-105" />
              <div className="relative px-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 text-sm">
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Stripeポータルへ接続中...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-indigo-200" />
                    <span>定期課金の解約・プラン管理（Stripe公式ポータル）へ</span>
                    <ExternalLink className="w-4 h-4 text-indigo-200 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </div>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              ※Stripe公式の安全な暗号化画面に移動し、ワンクリックで解約・カード変更が可能です。
            </p>
          </div>
        </div>

        {/* 顧客IDが見つからない場合のメール検索フォーム */}
        <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Mail className="w-4 h-4 text-purple-400" />
            <span>決済時のメールアドレスからポータルを開く</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            別の端末やブラウザから解約・確認される場合は、お支払い時にStripeに入力したメールアドレスを入力してください。
          </p>

          <form onSubmit={handleOpenCustomerPortal} className="space-y-3 pt-1">
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingPortal || !emailInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>確認中...</span>
                </>
              ) : (
                <>
                  <span>このメールアドレスでポータルを開く</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 解約に関する安心ガイド */}
        <div className="p-5 rounded-3xl bg-[#101524] border border-slate-800/80 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>解約・サブスクリプションに関するQ&A</span>
          </div>
          
          <div className="space-y-3 text-slate-400 text-[11px] leading-relaxed">
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">Q. いつ解約できますか？違約金はありますか？</p>
              <p>A. ご契約期間の縛りは一切ございません。登録直後であってもいつでも手数料・違約金ゼロで即時解約いただけます。</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">Q. 解約したらいつまでレポートを閲覧できますか？</p>
              <p>A. 次回更新日の前日（当月のご契約期間終了）まで、アンロック済みの詳細カルテやCBTワークを引き続き閲覧いただけます。</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">Q. クレジットカード明細にはどのように記載されますか？</p>
              <p>A. 「KOKORONAVI」または「STRIPE」と記載されます。</p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <LegalFooter onOpenLegal={handleOpenLegal} showAd={false} />

      {/* 法務モーダル */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C101C] text-white flex items-center justify-center text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400 mr-2" />
          アカウント情報を読み込み中...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
