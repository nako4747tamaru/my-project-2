'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Mail,
  Sparkles,
  AlertCircle,
  HelpCircle,
  History,
  Trash2,
  ChevronRight,
  User as UserIcon,
  LogIn,
  LogOut,
  Lock,
  KeyRound,
  CheckCircle2,
  Calendar,
  Settings,
  RefreshCw,
  Clock,
  Receipt,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import OwlMascot from '../../components/common/OwlMascot';
import LegalFooter from '../../components/common/LegalFooter';
import LegalModal, { LegalTab } from '../../components/common/LegalModal';
import {
  DiagnosticHistoryItem,
  getDiagnosticHistories,
  removeDiagnosticHistory,
  clearDiagnosticHistories,
} from '../../lib/history';

interface UserState {
  id: string;
  email: string;
  name: string;
  isPremium?: boolean;
}

interface SubscriptionDetails {
  isPremium: boolean;
  status: string;
  subscriptionId?: string;
  customerId?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 認証関連ステート
  const [user, setUser] = useState<UserState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailAuth, setEmailAuth] = useState('');
  const [passwordAuth, setPasswordAuth] = useState('');
  const [nameAuth, setNameAuth] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // タブ管理
  const [activeTab, setActiveTab] = useState<'subscription' | 'history' | 'auth' | 'settings'>('subscription');

  // サブスクリプション詳細ステート
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoadingSubDetails, setIsLoadingSubDetails] = useState(false);

  // 設定タブ用ステート（名前変更・パスワード変更・退会）
  const [editName, setEditName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // 診断履歴ステート
  const [histories, setHistories] = useState<DiagnosticHistoryItem[]>([]);

  // Stripe ポータル関連ステート
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

  // サブスクリプション詳細のフェッチ
  const fetchSubscriptionDetails = async (email?: string, custId?: string) => {
    setIsLoadingSubDetails(true);
    try {
      const q = new URLSearchParams();
      if (email) q.set('email', email);
      if (custId) q.set('customerId', custId);
      const res = await fetch(`/api/subscription/details?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubDetails(data);
        if (data.isPremium) {
          setIsUnlocked(true);
          localStorage.setItem('kokoro_navi_premium_unlocked_v1', 'true');
        }
        if (data.customerId) {
          setCustomerId(data.customerId);
          localStorage.setItem('kokoro_navi_stripe_customer_id', data.customerId);
        }
      }
    } catch (e) {
      console.warn('Subscription details fetch failed:', e);
    } finally {
      setIsLoadingSubDetails(false);
    }
  };

  // 認証セッションの取得
  const checkAuthSession = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setEditName(data.user.name);
        if (data.user.email) {
          setEmailInput(data.user.email);
          setCustomerEmail(data.user.email);
        }
        if (data.user.isPremium) {
          setIsUnlocked(true);
        }
        fetchSubscriptionDetails(data.user.email, data.user.stripeCustomerId);
      } else {
        setUser(null);
        // 未ログイン時もローカルストレージ情報からサブスク詳細取得
        const storedEmail = localStorage.getItem('kokoro_navi_stripe_customer_email');
        const storedCustId = localStorage.getItem('kokoro_navi_stripe_customer_id');
        fetchSubscriptionDetails(storedEmail || undefined, storedCustId || undefined);
      }
    } catch (e) {
      console.error('Failed to check auth:', e);
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshHistories = () => {
    setHistories(getDiagnosticHistories());
  };

  useEffect(() => {
    checkAuthSession();
    refreshHistories();

    try {
      const storedUnlocked = localStorage.getItem('kokoro_navi_premium_unlocked_v1') === 'true';
      if (storedUnlocked) setIsUnlocked(true);

      const storedCustomerId = localStorage.getItem('kokoro_navi_stripe_customer_id');
      if (storedCustomerId) setCustomerId(storedCustomerId);

      const storedEmail = localStorage.getItem('kokoro_navi_stripe_customer_email');
      if (storedEmail) {
        setCustomerEmail(storedEmail);
        setEmailInput(storedEmail);
      }

      const storedSessionId = localStorage.getItem('kokoro_navi_stripe_session_id');
      if (storedSessionId) setSessionId(storedSessionId);

      const urlSessionId = searchParams.get('session_id');
      if (urlSessionId) {
        setSessionId(urlSessionId);
        localStorage.setItem('kokoro_navi_stripe_session_id', urlSessionId);
      }

      const tabParam = searchParams.get('tab');
      if (tabParam === 'history' || tabParam === 'subscription' || tabParam === 'auth' || tabParam === 'settings') {
        setActiveTab(tabParam as any);
      }

      const oauthProvider = searchParams.get('oauth_success');
      if (oauthProvider) {
        setStatusMessage(`🎉 ${oauthProvider.toUpperCase()} での認証が完了しました！`);
      }

      const oauthError = searchParams.get('error');
      if (oauthError) {
        setAuthError(`ソーシャルログインに失敗しました（${oauthError}）。通常のログインをお試しください。`);
        setActiveTab('auth');
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // 認証送信（ログイン／新規登録）
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmittingAuth(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          email: emailAuth,
          password: passwordAuth,
          name: nameAuth || 'ゲスト',
          customerId: customerId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '認証に失敗しました。');
      }

      setUser(data.user);
      setEditName(data.user.name);
      setAuthSuccess(data.message || '認証が成功しました！');
      setEmailInput(data.user.email);
      setCustomerEmail(data.user.email);
      setPasswordAuth('');

      // ログイン成功時にStripe会員権を再チェック＆同期
      fetchSubscriptionDetails(data.user.email, data.user.stripeCustomerId);

      setTimeout(() => {
        setActiveTab('subscription');
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || 'エラーが発生しました。');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      setUser(null);
      setAuthSuccess('ログアウトしました。');
      setTimeout(() => setAuthSuccess(null), 3000);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // プロフィール更新（名前）
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);
    setSettingsError(null);
    setIsUpdatingSettings(true);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          name: editName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '更新に失敗しました。');
      setUser(data.user);
      setSettingsMessage('ニックネームを更新しました！');
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // パスワード変更
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);
    setSettingsError(null);
    setIsUpdatingSettings(true);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '変更に失敗しました。');
      setSettingsMessage('パスワードを正常に変更しました！');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setSettingsMessage(null), 3500);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // アカウント削除（退会）
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('本当にアカウントを削除しますか？\n※退会すると登録情報やセッションが破棄されます。')) {
      return;
    }
    setSettingsMessage(null);
    setSettingsError(null);
    setIsUpdatingSettings(true);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deleteConfirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '退会処理に失敗しました。');
      alert(data.message || 'アカウントを削除しました。');
      setUser(null);
      setIsUnlocked(false);
      localStorage.removeItem('kokoro_navi_premium_unlocked_v1');
      router.push('/');
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Stripe カスタマーポータルを開く
  const handleOpenCustomerPortal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoadingPortal(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const targetEmail = emailInput.trim() || customerEmail || user?.email || undefined;
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

  // 履歴削除
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この診断履歴を削除しますか？')) {
      const updated = removeDiagnosticHistory(id);
      setHistories(updated);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('すべての診断履歴をクリアしますか？（元に戻せません）')) {
      clearDiagnosticHistories();
      setHistories([]);
    }
  };

  // 更新日のフォーマット
  const formatPeriodEnd = (timestamp?: number) => {
    if (!timestamp) return '未定';
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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

          <div>
            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-[11px] text-rose-200 cursor-pointer"
                title="ログアウト"
              >
                <LogOut className="w-3 h-3" />
                <span>ログアウト</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-[11px] text-indigo-200 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>ログイン</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* ユーザーアカウント概要バー */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {user ? `${user.name} さん` : 'ゲストユーザー'}
                </span>
                {isUnlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    PREMIUM
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {user ? user.email : 'ログインすると複数端末で履歴を同期・管理できます'}
              </p>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => setActiveTab('auth')}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer shadow"
            >
              ログイン / 登録
            </button>
          )}
        </div>

        {/* タブナビゲーション（4タブ） */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>契約・課金</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>履歴 ({histories.length})</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>設定</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'auth'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{user ? '認証管理' : 'ログイン'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* タブ1: サブスクリプション状態の詳細ダッシュボード表示 */}
        {/* ======================================================== */}
        {activeTab === 'subscription' && (
          <div className="space-y-5 animate-fadeIn">
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

            {/* サブスクリプション状態詳細カード */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#182033] via-[#141A2B] to-[#101422] border border-slate-700/70 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">ご契約プラン・請求ステータス</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchSubscriptionDetails(user?.email || customerEmail || undefined, customerId || undefined)}
                    disabled={isLoadingSubDetails}
                    title="最新の状態に更新"
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubDetails ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      プレミアム会員（有効）
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                      無料プラン
                    </span>
                  )}
                </div>
              </div>

              {/* プラン詳細グリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-black/30 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">プラン名称</span>
                  <p className="font-bold text-white text-xs sm:text-sm">
                    {subDetails?.planName || 'ココロナビ 完全レポート解放（月額会員）'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">お支払い金額</span>
                  <p className="font-bold text-amber-300 text-xs sm:text-sm">
                    ¥{(subDetails?.amount || 980).toLocaleString()} / 月（税込）
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>次回更新日 / 請求予定</span>
                  </span>
                  <p className="font-bold text-slate-200 text-xs">
                    {subDetails?.currentPeriodEnd ? formatPeriodEnd(subDetails.currentPeriodEnd) : '契約中（次回更新あり）'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-indigo-400" />
                    <span>更新ステータス</span>
                  </span>
                  <p className="font-bold text-xs">
                    {subDetails?.cancelAtPeriodEnd ? (
                      <span className="text-amber-400">期間終了時に解約予定</span>
                    ) : isUnlocked ? (
                      <span className="text-emerald-400">自動更新中（いつでも解約可）</span>
                    ) : (
                      <span className="text-slate-400">未登録</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stripeカスタマーポータルへのダイレクトリンクボタン */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenCustomerPortal()}
                  disabled={isLoadingPortal}
                  className="w-full relative group overflow-hidden rounded-2xl p-[1px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl transition-all duration-300 group-hover:scale-105" />
                  <div className="relative px-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 text-xs sm:text-sm">
                    {isLoadingPortal ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Stripeポータルへ接続中...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-indigo-200" />
                        <span>Stripe公式ポータルを開く（解約・カード変更・領収書）</span>
                        <ExternalLink className="w-4 h-4 text-indigo-200 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </div>
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  ※Stripe公式の安全な暗号化画面に移動し、ワンクリックで解約・カード変更が可能です。
                </p>
              </div>
            </div>

            {/* 決済時メールアドレスでの照合 */}
            <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>メールアドレスからポータルを開く</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                決済時にStripeに入力したメールアドレスを入力してポータル画面を開くこともできます。
              </p>

              <form onSubmit={handleOpenCustomerPortal} className="space-y-3 pt-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
                />
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
                      <span>ポータル画面へ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* タブ2: 診断履歴 */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">過去の診断履歴一覧</h2>
              </div>
              {histories.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>すべて削除</span>
                </button>
              )}
            </div>

            {histories.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <OwlMascot size={40} />
                <p className="text-xs text-slate-300 font-medium">まだ保存された診断履歴がありません</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  診断を完了して結果画面を表示すると、認知の歪みスコアや疲弊度が自動的にここに保存されます。
                </p>
                <Link
                  href="/"
                  className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow"
                >
                  今すぐ診断を始める
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {histories.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#182033] to-[#121726] border border-slate-700/70 hover:border-indigo-500/50 transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-white">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.formattedDate}
                        </span>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          title="履歴から削除"
                          className="p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 my-2.5 bg-black/20 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 mr-1">メンタル疲弊度:</span>
                        <span className="font-semibold text-amber-300">
                          {item.fatigueScore}点 ({item.fatigueStatus})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-1">受検者:</span>
                        <span className="font-semibold text-slate-200">{item.userName}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link
                        href={`/result?type=${item.type}&name=${encodeURIComponent(item.userName)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>この結果の詳細レポートを見る</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* タブ3: アカウント設定（名前変更・パスワード変更・退会） */}
        {/* ======================================================== */}
        {activeTab === 'settings' && user && (
          <div className="space-y-6 animate-fadeIn">
            {settingsMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settingsMessage}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            {/* プロフィール変更 */}
            <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>登録情報の変更</span>
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">メールアドレス（変更不可）</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">お名前（ニックネーム）</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  名前を変更する
                </button>
              </form>
            </div>

            {/* パスワード変更 */}
            <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>パスワードの変更</span>
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">現在のパスワード</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">新しいパスワード（6文字以上）</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-600 cursor-pointer disabled:opacity-50"
                >
                  パスワードを更新
                </button>
              </form>
            </div>

            {/* 退会処理（アカウント削除） */}
            <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <h3 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>アカウント削除（退会）</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                退会すると登録アカウント情報が完全に削除されます。定期課金を契約中の場合は、事前にStripeポータルよりサブスクリプションを解約してください。
              </p>
              <form onSubmit={handleDeleteAccount} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">確認のためパスワードを入力</label>
                  <input
                    type="password"
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    required
                    placeholder="パスワード"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-rose-800/60 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white font-bold text-xs border border-rose-700 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>アカウントを完全に削除する</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* タブ4: ログイン / 新規登録 */}
        {/* ======================================================== */}
        {activeTab === 'auth' && (
          <div className="space-y-5 animate-fadeIn">
            {user ? (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">ログイン中</h3>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>お名前: <strong className="text-white">{user.name}</strong></p>
                  <p>メールアドレス: <strong className="text-white">{user.email}</strong></p>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    アカウント設定へ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-[#141A29] border border-slate-700 shadow-xl space-y-4">
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    ログイン
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    新規アカウント登録
                  </button>
                </div>

                {authSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200">
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200">
                    {authError}
                  </div>
                )}

                {/* ソーシャルログインボタングループ (Google / X / Apple) */}
                <div className="space-y-2 pb-2">
                  <div className="text-[11px] text-slate-400 font-medium text-center mb-1.5">
                    SNSアカウントで1秒簡単ログイン
                  </div>

                  {/* 1. Google ログイン */}
                  <a
                    href="/api/auth/oauth/google"
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google で続ける</span>
                  </a>

                  {/* 2. X（Twitter）ログイン */}
                  <a
                    href="/api/auth/oauth/twitter"
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md border border-slate-700/80 active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>X (Twitter) で続ける</span>
                  </a>

                  {/* 3. Apple ログイン */}
                  <a
                    href="/api/auth/oauth/apple"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1e2333] hover:bg-[#252c40] text-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md border border-slate-700/60 active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.56-7.8-11.6-14.15-5.99-9.37-10.74-20.14-14.25-32.31-3.52-12.18-5.28-23.71-5.28-34.6 0-14.45 3.63-26.68 10.9-36.68 7.27-10 16.63-15.12 28.08-15.35 4.67 0 10.02 1.25 16.06 3.75 6.04 2.5 10.15 3.82 12.33 3.96 1.94-.14 6.27-1.52 12.98-4.14 6.71-2.62 12.22-3.83 16.54-3.64 12.56.63 22.84 5.37 30.84 14.22-10.98 6.66-16.35 15.82-16.12 27.48.24 9.17 3.88 16.92 10.93 23.25 7.05 6.33 15.43 10.03 25.14 11.11-2.22 6.88-5.07 14.1-8.56 21.67zM119.22 31.84c0-7.72 2.76-14.94 8.28-21.65 5.53-6.72 12.31-10.45 20.35-11.19.14 1.1.21 2.05.21 2.85 0 7.6-2.88 14.88-8.63 21.84-5.75 6.96-12.61 10.74-20.58 11.33-.27-1.12-.41-2.18-.41-3.18z" />
                    </svg>
                    <span>Apple で続ける</span>
                  </a>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-[#141A29] px-2.5 text-[10px] text-slate-500 uppercase">
                    またはメールアドレスで
                  </span>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        お名前（ニックネーム）
                      </label>
                      <input
                        type="text"
                        value={nameAuth}
                        onChange={(e) => setNameAuth(e.target.value)}
                        placeholder="たか"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={emailAuth}
                      onChange={(e) => setEmailAuth(e.target.value)}
                      placeholder="user@example.com"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      パスワード（6文字以上）
                    </label>
                    <input
                      type="password"
                      value={passwordAuth}
                      onChange={(e) => setPasswordAuth(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingAuth ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <KeyRound className="w-4 h-4 text-indigo-200" />
                    )}
                    <span>{authMode === 'login' ? 'ログインする' : '無料でアカウント作成'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
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
