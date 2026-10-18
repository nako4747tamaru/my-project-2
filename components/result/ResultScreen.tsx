'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Lock,
  Sparkles,
  AlertTriangle,
  Leaf,
  Clock,
  ChevronRight,
  Share2,
  RotateCcw,
  Check,
  Compass,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Camera,
  FileDown,
  Loader2,
} from 'lucide-react';

import { QUESTIONS as defaultQuestions } from '../../lib/questions';
import {
  calculatePersonality,
  PersonalityResult,
  Answers,
  DistortionScoreItem,
  Question,
} from '../../lib/personality';
import OwlMascot from '../common/OwlMascot';
import DistortionRadarChart from './DistortionRadarChart';
import LegalModal, { LegalTab } from '../common/LegalModal';
import LegalFooter from '../common/LegalFooter';

export interface ResultScreenProps {
  /** ユーザーのニックネーム */
  userName?: string;
  /** ユーザーの回答（質問IDまたはインデックス -> 1〜5の選択値） */
  answers?: Answers;
  /** 質問リスト（未指定時は標準の100問を使用） */
  questions?: Question[];
  /** 事前計算済みの結果（指定があれば計算をスキップ） */
  initialResult?: PersonalityResult;
  /** 有料プラン解放時のコールバック（Stripe決済URL遷移など） */
  onUnlockPremium?: () => void;
  /** 再診断ボタン押下時のコールバック */
  onRetest?: () => void;
  /** シェアボタン押下時のコールバック */
  onShare?: () => void;
  /** 既に有料会員であるかどうかのフラグ */
  isPremiumUnlocked?: boolean;
}

/**
 * デフォルトのサンプル回答生成
 * (INTP, 要休息レベル5, 白黒思考・すべき思考傾向)
 */
function createSampleAnswers(questionsList: Question[] = defaultQuestions): Answers {
  const sample: Answers = {};
  questionsList.forEach((q, idx) => {
    const key = q.id ?? idx + 1;
    let val = 3;
    if (q.dim === 'EI') {
      val = q.pole === 'I' ? 4 : 2; // I高め
    } else if (q.dim === 'SN') {
      val = q.pole === 'N' ? 4 : 2; // N高め
    } else if (q.dim === 'TF') {
      val = q.pole === 'T' ? 5 : 2; // T高め -> INTP
    } else if (q.dim === 'JP') {
      val = q.pole === 'P' ? 4 : 2; // P高め
    } else if (q.dim === 'fatigue') {
      val = 5; // 要休息 (レベル5)
    } else if (q.dim === 'all-or-nothing' || q.dim === 'should') {
      val = 5; // 顕著な歪み
    } else {
      val = 3;
    }
    sample[key] = val;
    sample[idx] = val;
  });
  return sample;
}

/**
 * 2×2 配置の SNSシェア ＆ 画像・PDF保存ボタングループ
 */
interface ShareButtonGroupProps {
  onShareX: () => void;
  onShareLine: () => void;
  onSaveImage: () => void;
  onShareNative: () => void;
  onSavePdf: () => void;
  isExportingImage: boolean;
  isExportingPdf: boolean;
  isExportingAny: boolean;
  title?: string;
  subtitle?: string;
}

function ShareButtonGroup({
  onShareX,
  onShareLine,
  onSaveImage,
  onShareNative,
  onSavePdf,
  isExportingImage,
  isExportingPdf,
  isExportingAny,
  title = '診断結果をシェア・保存',
  subtitle = 'X・LINE・Instagram・TikTok対応',
}: ShareButtonGroupProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#1C2339] to-[#121625] border border-slate-700/70 p-4 sm:p-5 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">{title}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
      </div>

      {/* 2×2 グリッド配置（スマートフォン・PC両対応） */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* 1. X（旧Twitter）シェアボタン */}
        <button
          onClick={onShareX}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-[#0b0e14] hover:bg-[#141a24] border border-slate-700/80 hover:border-slate-500 shadow-md text-left transition-all active:scale-[0.98] cursor-pointer group"
          title="診断結果をXでポスト"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold group-hover:text-white">
              ポスト
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">X でシェア</span>
          <span className="text-[10px] text-slate-400 mt-0.5">#ココロナビ 投稿</span>
        </button>

        {/* 2. LINEで送るボタン */}
        <button
          onClick={onShareLine}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] shadow-md shadow-emerald-950/40 text-left transition-all active:scale-[0.98] cursor-pointer group"
          title="LINEで友だちやトークに共有"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center text-white">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.576.39.085.922.259 1.057.595.121.304.08.779.039 1.085l-.171 1.026c-.053.303-.242 1.185 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.589-3.864 2.589-5.965z"/>
              </svg>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white font-semibold">
              トーク
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">LINEで送る</span>
          <span className="text-[10px] text-emerald-100 mt-0.5">友だちに教える</span>
        </button>

        {/* 3. 「結果カードを画像として保存」（Instagram・TikTok・保存用） */}
        <button
          onClick={onSaveImage}
          disabled={isExportingAny}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 shadow-md shadow-pink-950/40 text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          title="インスタストーリーやTikTok用の高画質画像（PNG）として保存"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-white">
              {isExportingImage ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Camera className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              )}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/25 text-white font-semibold">
              PNG保存
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {isExportingImage ? '画像作成中...' : '画像として保存'}
          </span>
          <span className="text-[10px] text-pink-100 mt-0.5">ストーリー・TikTok📸</span>
        </button>

        {/* 4. スマホ標準の共有（Web Share API / その他） */}
        <button
          onClick={onShareNative}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-md shadow-indigo-950/40 text-left transition-all active:scale-[0.98] cursor-pointer group"
          title="AirDropやその他のSNSで共有、またはリンクをコピー"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/25 text-white font-semibold">
              共有
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">その他で共有</span>
          <span className="text-[10px] text-indigo-100 mt-0.5">AirDrop・リンクコピー</span>
        </button>
      </div>

      {/* PDF形式ダウンロード用オプションボタン */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span className="text-[10px] text-slate-400">印刷・保管用フォーマット</span>
        <button
          onClick={onSavePdf}
          disabled={isExportingAny}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 py-1 px-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
              <span>PDF作成中...</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDFでダウンロード</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ResultScreen({
  userName = 'たか',
  answers,
  questions = defaultQuestions,
  initialResult,
  onUnlockPremium,
  onRetest,
  onShare,
  isPremiumUnlocked = false,
}: ResultScreenProps) {
  // 診断結果の算出
  const result: PersonalityResult = useMemo(() => {
    if (initialResult) return initialResult;
    const finalAnswers =
      answers && Object.keys(answers).length > 0
        ? answers
        : createSampleAnswers(questions);
    return calculatePersonality(questions, finalAnswers);
  }, [answers, questions, initialResult]);

  const [unlocked, setUnlocked] = useState(isPremiumUnlocked);
  const [showAxesDetail, setShowAxesDetail] = useState(true);

  // 画像 / PDF 保存用のステート
  const [exportingState, setExportingState] = useState<'idle' | 'image' | 'pdf'>('idle');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);

  // 法務・規約モーダルステート
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // キャプチャ対象エリアの参照
  const captureCardRef = useRef<HTMLDivElement>(null);

  const topDistortion = result.topDistortions[0];

  // Stripe決済ボタンハンドラー
  const handleCheckout = () => {
    if (onUnlockPremium) {
      onUnlockPremium();
    } else {
      setUnlocked(true);
    }
  };

  // 共通の共有用文言生成
  const getShareDetails = () => {
    const typeName = result.info.shortName || result.info.name || result.title;
    const distortionSnippet = topDistortion?.name ? `\n🧠 思考の癖傾向: ${topDistortion.name}` : '';
    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.origin || window.location.href
        : 'https://kokoronavi.com';

    const shareText = `＼ ココロナビで心と性格を診断したよ 🦉✨ ／

【${userName}さんの診断結果】
🕊️ タイプ: ${result.type}（${typeName}）
💬 「${result.catchphrase}」
🌿 メンタル疲弊度: ${result.fatigue.title} (Lv.${result.fatigue.level}/5)${distortionSnippet}

100問の対話で、自分だけの取扱説明書と心の処方箋が届きました💌
あなたは何タイプ？ここから無料で診断できるよ👇
${shareUrl}

#ココロナビ #性格診断 #MBTI`;

    return { shareText, shareUrl, typeName };
  };

  // 1. X（旧Twitter）シェア
  const handleShareX = () => {
    const { shareText, shareUrl } = getShareDetails();
    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;

    if (onShare) onShare();

    if (typeof window !== 'undefined') {
      window.open(tweetIntentUrl, '_blank', 'noopener,noreferrer');
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
    }

    setExportSuccessMessage('X投稿画面を開きました！（文言をコピーしました🕊️）');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  // 2. LINEで送る
  const handleShareLine = () => {
    const { shareUrl } = getShareDetails();
    // LINE公式の共有URL
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      shareUrl
    )}`;

    if (onShare) onShare();

    if (typeof window !== 'undefined') {
      window.open(lineShareUrl, '_blank', 'noopener,noreferrer');
    }

    setExportSuccessMessage('LINEの共有画面を開きました！💬');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  // 4. スマホ標準の共有（Web Share API / その他）
  const handleShareNative = async () => {
    const { shareText, shareUrl, typeName } = getShareDetails();
    if (onShare) onShare();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `【ココロナビ】${userName}さんの診断結果: ${result.type}（${typeName}）`,
          text: shareText,
          url: shareUrl,
        });
        setExportSuccessMessage('診断結果を共有しました！✨');
        setTimeout(() => setExportSuccessMessage(null), 3500);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // ユーザーキャンセル
        }
      }
    }

    // クリップボードへコピー（PCなど非対応環境）
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setExportSuccessMessage('診断URLと結果をコピーしました！プロフィールのURLやメッセージに貼ってね📋');
        setTimeout(() => setExportSuccessMessage(null), 3500);
      } catch {
        setExportErrorMessage('クリップボードへのコピーに失敗しました');
        setTimeout(() => setExportErrorMessage(null), 3500);
      }
    }
  };

  // キャプチャ実行ヘルパー関数
  const executeCapture = async (): Promise<HTMLCanvasElement | null> => {
    if (!captureCardRef.current) return null;

    // 動的インポート（SSR対策＆バンドル軽量化）
    const html2canvas = (await import('html2canvas')).default;

    const element = captureCardRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // 高解像度（Retina）
      useCORS: true,
      logging: false,
      backgroundColor: '#0C101C', // ダークテーマ背景色
      windowWidth: element.scrollWidth,
    });

    return canvas;
  };

  // ファイル名生成（安全な文字列）
  const getSafeFileName = (extension: string) => {
    const cleanName = (userName || 'result').replace(/[/\\?%*:|"<>]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    return `kokoro-navi-${cleanName}-${result.type}-${dateStr}.${extension}`;
  };

  // 3. 画像（PNG）として保存（Instagram・TikTok・保存用）
  const handleSaveImage = async () => {
    if (exportingState !== 'idle') return;
    try {
      setExportingState('image');
      setExportErrorMessage(null);

      // DOM更新とレンダリング準備のためのマイクロウェイト
      await new Promise((r) => setTimeout(r, 120));

      const canvas = await executeCapture();
      if (!canvas) throw new Error('キャプチャ対象が見つかりませんでした');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = getSafeFileName('png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccessMessage('診断結果画像を保存しました！ストーリーやTikTokでシェアしてね📸');
      setTimeout(() => setExportSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export image:', err);
      setExportErrorMessage('画像の保存に失敗しました。もう一度お試しください。');
      setTimeout(() => setExportErrorMessage(null), 3500);
    } finally {
      setExportingState('idle');
    }
  };

  // PDFとしてダウンロード
  const handleSavePdf = async () => {
    if (exportingState !== 'idle') return;
    try {
      setExportingState('pdf');
      setExportErrorMessage(null);

      // DOM更新とレンダリング準備のためのマイクロウェイト
      await new Promise((r) => setTimeout(r, 120));

      const canvas = await executeCapture();
      if (!canvas) throw new Error('キャプチャ対象が見つかりませんでした');

      const { jsPDF } = await import('jspdf');

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4幅 210mm を基準に、カードの縦横比に応じた高さを算出
      const pdfWidth = 210;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(getSafeFileName('pdf'));

      setExportSuccessMessage('診断結果カード（PDF）をダウンロードしました！📄');
      setTimeout(() => setExportSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportErrorMessage('PDFの作成に失敗しました。もう一度お試しください。');
      setTimeout(() => setExportErrorMessage(null), 3500);
    } finally {
      setExportingState('idle');
    }
  };

  // 疲弊度ゲージのカラー設定 (1〜5)
  const GAUGE_COLORS = [
    { level: 1, bg: 'bg-[#10B981]', activeBorder: 'ring-[#10B981]' }, // 元気
    { level: 2, bg: 'bg-[#84CC16]', activeBorder: 'ring-[#84CC16]' },
    { level: 3, bg: 'bg-[#F59E0B]', activeBorder: 'ring-[#F59E0B]' },
    { level: 4, bg: 'bg-[#F97316]', activeBorder: 'ring-[#F97316]' },
    { level: 5, bg: 'bg-[#EF4444]', activeBorder: 'ring-[#EF4444]' }, // 要休息
  ];

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 font-sans pb-16 selection:bg-purple-900 selection:text-purple-200">
      {/* --- ヘッダー / ナビバー --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-100 tracking-tight">分析結果</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-medium">
              100問完了
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenLegal('privacy')}
              title="プライバシーポリシー・利用規約"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-400 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">規約・ポリシー</span>
            </button>

            {onRetest && (
              <button
                onClick={onRetest}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>再診断</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* サブヘッダー表示 */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-1 text-center">
        <p className="text-xs text-slate-400 font-medium">
          {userName}さんのレポート ・ 100問回答済み
        </p>
      </div>

      <main className="max-w-md mx-auto px-4 py-3 space-y-5">
        {/* ======================================================== */}
        {/* ダウンロード ＆ SNSシェアカード (上部クイックアクセス) */}
        {/* ======================================================== */}
        <ShareButtonGroup
          onShareX={handleShareX}
          onShareLine={handleShareLine}
          onSaveImage={handleSaveImage}
          onShareNative={handleShareNative}
          onSavePdf={handleSavePdf}
          isExportingImage={exportingState === 'image'}
          isExportingPdf={exportingState === 'pdf'}
          isExportingAny={exportingState !== 'idle'}
          title="診断結果をシェア・保存"
          subtitle="SNS対応 ＆ 高画質保存"
        />

        {/* ======================================================== */}
        {/* キャプチャ対象エリア (ユーザーの診断結果カード群) */}
        {/* MBTIタイプ、認知の歪みスコア、レーダーチャート、疲弊度等を含む */}
        {/* ======================================================== */}
        <div
          ref={captureCardRef}
          id="diagnostic-result-capture-area"
          className="space-y-5 rounded-3xl bg-[#0C101C] p-0.5"
          style={{ backgroundColor: '#0C101C', color: '#F1F5F9' }}
        >
          {/* キャプチャ画像用公式ヘッダーバナー */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1E1B4B]/95 via-[#2A164D]/90 to-[#181F33]/95 border border-indigo-500/40 p-3.5 flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-950 border border-indigo-400/50 shadow-inner">
                <OwlMascot size={28} />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs tracking-wide flex items-center gap-1.5">
                  ココロナビ 診断カルテ
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">公式</span>
                </p>
                <p className="text-[10px] text-indigo-300/90">100問の対話で導く心と性格の取扱説明書</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-200 border border-indigo-700/80 text-[10px] font-bold">
                {userName} さん
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">100問回答完了済み</p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 1. MBTI 16タイプカード */}
          {/* ======================================================== */}
          <section className="relative rounded-3xl bg-gradient-to-b from-[#1C2339] via-[#161C2E] to-[#121625] border border-slate-700/60 shadow-2xl p-6 text-center overflow-hidden">
            {/* 上部ヘッダー（グループバッジ ＆ スライドインジケータ） */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2 py-1 rounded-md bg-slate-800/50">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>1 / 1</span>
              </div>

              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#3B2D6B] border border-purple-500/30 text-purple-200 text-xs font-semibold tracking-wide shadow-sm">
                <span>{result.info.group || '分析家グループ'}</span>
              </div>

              <div className="w-8" />
            </div>

            {/* フクロウマスコット */}
            <div className="flex justify-center my-2">
              <div className="p-2 rounded-full bg-gradient-to-b from-[#2B3454] to-[#1B2238] border-2 border-indigo-400/40 shadow-lg shadow-indigo-950/50">
                <OwlMascot size={72} />
              </div>
            </div>

            {/* 診断タイプ表示 */}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                {userName}さんの診断タイプ
              </p>
              <h1 className="text-5xl font-black tracking-wider text-white">
                {result.type}
              </h1>
              <p className="text-xl font-bold text-slate-200">
                {result.info.shortName || result.title}
              </p>
            </div>

            {/* キャッチフレーズ */}
            <div className="mt-3.5 inline-block max-w-full">
              <div className="px-4 py-1.5 rounded-full bg-[#242C44]/80 border border-slate-700/60 text-xs sm:text-sm text-slate-300 font-medium">
                {result.catchphrase}
              </div>
            </div>

            {/* 説明文 */}
            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed text-left bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
              {result.description}
            </p>

            {/* タグリスト */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {(result.info.tags || ['#分析力', '#独創性', '#客観性']).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full bg-[#20273D] text-slate-300 border border-slate-700/70 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 4軸の内訳アコーディオン */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setShowAxesDetail(!showAxesDetail)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  4軸のバランス詳細（MBTI）
                </span>
                {showAxesDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAxesDetail && (
                <div className="mt-3 space-y-3 pt-2 text-left animate-fadeIn">
                  {[
                    { key: 'EI', labelL: 'E 外向', labelR: 'I 内向', data: result.axes.EI },
                    { key: 'SN', labelL: 'S 感覚', labelR: 'N 直観', data: result.axes.SN },
                    { key: 'TF', labelL: 'T 思考', labelR: 'F 感情', data: result.axes.TF },
                    { key: 'JP', labelL: 'J 判断', labelR: 'P 知覚', data: result.axes.JP },
                  ].map(({ key, labelL, labelR, data }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                        <span>{labelL} ({data.percentageA}%)</span>
                        <span className="text-indigo-400 font-bold">{data.primary}型</span>
                        <span>{labelR} ({data.percentageB}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${data.percentageA}%` }}
                        />
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${data.percentageB}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ======================================================== */}
          {/* 2. メンタル疲弊度メーターカード */}
          {/* ======================================================== */}
          <section className="rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>メンタル疲弊度</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                充電状態チェック
              </span>
            </div>

            {/* タイトル ＆ スコア */}
            <div className="flex items-baseline justify-between pt-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {result.fatigue.title}
              </h2>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-100">{result.fatigue.level}</span>
                <span className="text-sm text-slate-400 font-bold">/ 5</span>
              </div>
            </div>

            {/* 5分割カラーゲージ */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-5 gap-2">
                {GAUGE_COLORS.map((g) => {
                  const isSelected = g.level === result.fatigue.level;
                  const isPassed = g.level <= result.fatigue.level;
                  return (
                    <div key={g.level} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full h-3 rounded-full transition-all duration-300 ${g.bg} ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#181F33] scale-105 opacity-100'
                            : isPassed
                            ? 'opacity-80'
                            : 'opacity-25'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {g.level}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 左右ラベル */}
              <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>元気</span>
                <span>要休息</span>
              </div>
            </div>

            {/* メッセージバブル */}
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.fatigue.message}
            </div>
          </section>

          {/* ======================================================== */}
          {/* 3. 認知の歪みスコア ＆ レーダーチャートカード */}
          {/* ======================================================== */}
          <section className="rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>認知の歪みスコア ＆ レーダーチャート</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-medium">
                7パターン総合分析
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              日常生活で無意識に発動している「思考の癖」のバランスです。偏りが大きい項目ほどストレスの引き金になりやすい傾向があります。
            </p>

            {/* レーダーチャート描画エリア */}
            <div className="py-2.5 px-1 bg-slate-900/50 rounded-2xl border border-slate-800/80 flex justify-center">
              <DistortionRadarChart distortions={result.distortions} size={300} />
            </div>

            {/* 最も顕著な思考癖のピックアップ */}
            {topDistortion && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#291E3B] to-[#191D33] border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    最も出やすい思考の癖
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full bg-slate-900/60 border border-amber-500/30">
                    スコア {topDistortion.percentage}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {topDistortion.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {topDistortion.explanation}
                </p>
              </div>
            )}

            {/* 7パターンのスコア一覧ミニバー */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>思考癖パターン</span>
                <span>傾向スコア</span>
              </div>
              <div className="space-y-2">
                {result.distortions.map((d) => (
                  <div key={d.type} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-[11px] text-slate-300 truncate font-medium">
                      {d.shortName || d.name}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-amber-300 font-bold">
                      {d.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* キャプチャ画像用バイラル流入バナー（インスタストーリー・TikTok対応） */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-gradient-to-r from-[#211638] via-[#1A1D33] to-[#121B35] border border-pink-500/40 p-4 text-center shadow-lg space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-950 border border-indigo-400/50 shadow-inner">
                <OwlMascot size={26} />
              </div>
              <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-300">
                ココロナビ KokoroNavi
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-black text-white tracking-wide">
                ＼ あなたは何タイプ？ 🦉💭 ／
              </p>
              <p className="text-xs text-pink-200 font-bold">
                プロフィールのURLから診断してみてね！
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 px-1 border-t border-slate-700/50">
              <span className="font-mono text-indigo-300">kokoronavi.com</span>
              <span className="font-bold text-slate-300">#ココロナビ #性格診断</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ダウンロード ＆ SNSシェアカード (下部リピート) */}
        {/* ======================================================== */}
        <ShareButtonGroup
          onShareX={handleShareX}
          onShareLine={handleShareLine}
          onSaveImage={handleSaveImage}
          onShareNative={handleShareNative}
          onSavePdf={handleSavePdf}
          isExportingImage={exportingState === 'image'}
          isExportingPdf={exportingState === 'pdf'}
          isExportingAny={exportingState !== 'idle'}
          title="診断カルテを保存・友だちに送る"
          subtitle="いつでも見返せます"
        />

        {/* ======================================================== */}
        {/* 4. メンタルケア・行動アドバイス */}
        {/* ======================================================== */}
        <section className="rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl space-y-5">
          {/* ヘッダー */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
              <span>MENTAL CARE</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              メンタルケア・行動アドバイス
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {result.info.shortName || result.title}タイプが疲れたときに出やすいサインと、1日3分でできるワークだよ。
            </p>
          </div>

          {/* 陥りやすいストレスパターン */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              陥りやすいストレスパターン
            </h3>

            {(result.info.stressPatterns || [
              {
                title: '考えすぎて動けず、自己嫌悪に陥る',
                advice: '完璧な答えより、5分で試せる仮説を優先しよう。',
              },
              {
                title: '摩擦を避けて、気づけば孤立しがち',
                advice: '気軽に話せる人をひとりだけ思い浮かべておこう。',
              },
            ]).map((pattern, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#1F273D]/70 border border-slate-700/60 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-rose-950/80 border border-rose-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-100">
                    {pattern.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {pattern.advice}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* おすすめの認知行動療法ワーク */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300">
                おすすめの認知行動療法ワーク
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>1日3分</span>
              </div>
            </div>

            {(result.info.cbtWorks || [
              {
                category: '行動活性化',
                title: '5分アクションプラン',
                description: '気分を待たずに、小さな行動から心を動かす',
              },
              {
                category: '問題解決療法',
                title: '心配ごとの仕分け',
                description: '頭の中の不安を「できること」と「手放すこと」に分ける',
              },
            ]).map((work, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#1F273D]/70 hover:bg-[#252E47] border border-slate-700/60 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center shrink-0 text-purple-300 font-mono text-xs font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 font-semibold">
                      {work.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">
                      {work.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {work.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. 有料エリア（認知の歪み7パターン詳細分析 ＆ モザイク・ロック） */}
        {/* ======================================================== */}
        <section className="relative rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">認知の歪み7パターン詳細分析 ＆ 自分だけのメンタル処方箋</h3>
            </div>
            {!unlocked ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 shadow-sm">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                PREMIUM
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                解放済み
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            物事の捉え方の癖（認知の歪み7パターン）を数値化し、心を楽にする「1日3分のCBTセルフケアワーク（自分だけのメンタル処方箋）」を提供します。
          </p>

          {/* 歪みスコア一覧（ロック時はぼかし表示） */}
          <div className={`space-y-3 transition-all ${!unlocked ? 'filter blur-[7px] opacity-75 select-none pointer-events-none' : ''}`}>
            {result.distortions.map((d: DistortionScoreItem, idx: number) => {
              const isTop = d.type === topDistortion?.type;
              return (
                <div
                  key={d.type}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-[#24213D] border-rose-500/50 shadow-md shadow-rose-950/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{d.name}</span>
                      {isTop && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-200 font-bold tracking-wide">
                          最も顕著
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {d.percentage}%
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {d.explanation}
                  </p>

                  {/* 解放時のみ表示される詳細ワークヒント */}
                  {unlocked && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200">
                        <span className="font-bold text-purple-300 mr-1.5">💡 リフレーミングの問い:</span>
                        {d.reframingQuestion}
                      </div>
                      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200">
                        <span className="font-bold text-indigo-300 mr-1.5">🎯 今日の1日3分アクション:</span>
                        {d.actionTip}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 解放時専用：メンタル処方箋サマリーカード */}
            {unlocked && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/60 to-slate-900 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>あなた専用のメンタル処方箋シート</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  {userName}さん（{result.type}型）の心の回復ステップ
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  思考の癖「{topDistortion?.name}」が出たときは、まず「事実」と「感情」をノートに書き分け、上記の「リフレーミングの問い」を自分に投げかけてみてください。1日3分の習慣で、驚くほど心が軽くなります。
                </p>
              </div>
            )}
          </div>

          {/* ロックオーバーレイ（未購入時） */}
          {!unlocked && (
            <div className="absolute inset-0 bg-[#0C101C]/88 backdrop-blur-md flex flex-col items-center justify-center p-5 sm:p-6 text-center z-20 overflow-y-auto">
              {/* 初月お試しキャンペーンバッジ */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-purple-500/25 border border-amber-400/60 text-amber-200 text-[11px] font-bold shadow-lg shadow-amber-950/50 mb-3 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>✨ 今なら初月お試しキャンペーン実施中！</span>
              </div>

              {/* アイコン */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-xl shadow-rose-950/60 mb-3 ring-4 ring-rose-500/20">
                <Lock className="w-6 h-6 text-white" />
              </div>

              {/* タイトル ＆ 温かみのあるキャッチコピー */}
              <h4 className="text-base sm:text-lg font-black text-white mb-1 tracking-tight">
                思考の癖をほどく、あなただけのメンタル処方箋
              </h4>
              <p className="text-xs text-purple-200/90 font-medium mb-2">
                もう、ひとりで抱え込まなくて大丈夫。
              </p>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                いつも周りのために頑張りすぎてしまう{userName}さんへ。16タイプ×認知行動療法（CBT）のアプローチで、無意識のモヤモヤ・自己否定のループをすーっと和らげる完全レポートを解放します。
              </p>

              {/* 得られるメリットの箇条書きカード */}
              <div className="w-full max-w-sm bg-gradient-to-b from-[#182038]/90 to-[#121729]/95 border border-slate-700/80 rounded-2xl p-4 mb-4 text-left space-y-3 shadow-inner">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block mb-0.5">
                      認知の歪み7パターン詳細分析
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      「白黒思考」「すべき思考」「心の読みすぎ」など無意識の思考癖を精密スコア化。なぜ落ち込んでしまうのか、心のつまずきポイントを根本から特定します。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block mb-0.5">
                      1日3分のCBTセルフケアワーク（メンタル処方箋）
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {result.type}型（{result.info.shortName || result.title}）専用の「リフレーミングの問い」と「今日できるアクション」。不安や焦りを感じたその場でサッと心をリセット。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block mb-0.5">
                      一生使えるあなただけの心の取扱説明書
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      スマホでいつでも読み返せる安心のセーフティネット。人間関係や仕事で疲れたときの心強いお守りになります。
                    </p>
                  </div>
                </div>
              </div>

              {/* 高輝度グラデーションCTAボタン */}
              <button
                onClick={handleCheckout}
                className="w-full max-w-sm relative group overflow-hidden rounded-2xl p-[2px] shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                {/* 背景のアニメーショングラデーション */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 rounded-2xl transition-all duration-300 group-hover:scale-105" />
                
                <div className="relative px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 text-white font-black flex flex-col items-center justify-center gap-0.5 transition-all group-hover:bg-opacity-95">
                  <div className="flex items-center gap-2 text-xs sm:text-sm tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>今すぐ初月お試しで完全レポートを解放する</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                  <span className="text-[10px] text-rose-100 font-medium">
                    初月限定 ¥980（1日たった32円） ・ 縛りなし / いつでも解約可能
                  </span>
                </div>
              </button>

              {/* 安心バッジ */}
              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  いつでも解約OK
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">🔒 Stripeセキュア決済</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">☕ 1日カフェ1杯以下の自己投資</span>
              </div>

              {/* プレビューボタン */}
              <button
                onClick={() => setUnlocked(true)}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer transition-colors"
              >
                プレビュー（デモ解放で中身を確認）
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 法務・規約フッター */}
      <LegalFooter onOpenLegal={handleOpenLegal} />

      {/* 法務・規約モーダル */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* ======================================================== */}
      {/* 処理中ローディング表示（連打・誤操作防止オーバーレイ） */}
      {/* ======================================================== */}
      {exportingState !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-[#0C101C]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1E2538] to-[#141A29] border border-indigo-500/40 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl space-y-4 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white">
                {exportingState === 'image' ? '保存画像を作成中...' : 'PDFを生成中...'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                診断結果カードを高画質でレンダリングしています。完了まで少々お待ちください。
              </p>
            </div>
            <div className="pt-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse w-4/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 完了・エラートースト通知 */}
      {/* ======================================================== */}
      {exportSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 text-xs font-bold shadow-xl shadow-emerald-950/50 flex items-center gap-2 animate-fadeIn max-w-[90vw]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{exportSuccessMessage}</span>
        </div>
      )}
      {exportErrorMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-rose-950/95 border border-rose-500/80 text-rose-200 text-xs font-bold shadow-xl shadow-rose-950/50 flex items-center gap-2 animate-fadeIn max-w-[90vw]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{exportErrorMessage}</span>
        </div>
      )}
    </div>
  );
}
