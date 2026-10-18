'use client';

import React, { useState, useMemo } from 'react';
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
  const [copied, setCopied] = useState(false);
  const [showAxesDetail, setShowAxesDetail] = useState(false);

  // Stripe決済ボタンハンドラー
  const handleCheckout = () => {
    if (onUnlockPremium) {
      onUnlockPremium();
    } else {
      setUnlocked(true);
    }
  };

  // シェア機能（X / 旧Twitter 投稿 & クリップボード）
  const handleShare = () => {
    const typeName = result.info.shortName || result.info.name || result.title;
    const distortionSnippet = topDistortion?.name ? `\n🧠 思考の癖傾向: ${topDistortion.name}` : '';
    const shareText = `＼ ココロナビで心と性格を診断したよ 🦉✨ ／

【${userName}さんの診断結果】
🕊️ タイプ: ${result.type}（${typeName}）
💬 「${result.catchphrase}」
🌿 メンタル疲弊度: ${result.fatigue.title} (Lv.${result.fatigue.level}/5)${distortionSnippet}

100問の対話で、自分だけの取扱説明書と心の処方箋が届きました💌
あなたのタイプも診断してみてね👇

#ココロナビ #性格診断 #MBTI`;

    const shareUrl = typeof window !== 'undefined' ? window.location.origin || window.location.href : 'https://kokoronavi.com';
    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;

    if (onShare) {
      onShare();
    }

    if (typeof window !== 'undefined') {
      window.open(tweetIntentUrl, '_blank', 'noopener,noreferrer');
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const topDistortion = result.topDistortions[0];

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
            {onRetest && (
              <button
                onClick={onRetest}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
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

      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        {/* ======================================================== */}
        {/* 1. MBTI 16タイプカード (Screenshot 4のメインカード) */}
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

          {/* シェアボタン (X / 旧Twitter) */}
          <div className="mt-6">
            <button
              onClick={handleShare}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] shadow-xl shadow-sky-950/60 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#1D9BF0] via-[#6366F1] to-[#EC4899] rounded-2xl transition-all duration-300 group-hover:opacity-100 opacity-90 group-hover:scale-105" />
              <div className="relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#141b2d]/90 via-[#182038]/80 to-[#1b1c35]/90 group-hover:bg-opacity-40 text-white font-bold text-sm transition-all">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                    <span className="text-emerald-200">X投稿画面を開きました！（文言コピー完了🕊️）</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-white transition-transform group-hover:rotate-12 group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="tracking-wide">診断結果をX（旧Twitter）でシェアする</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* 4軸の内訳アコーディオン */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setShowAxesDetail(!showAxesDetail)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                4軸のバランス詳細を表示
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
        {/* 2. メンタル疲弊度メーターカード (Screenshot 4の下部カード) */}
        {/* ======================================================== */}
        <section className="rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>メンタル疲弊度</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
              無料
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
        {/* 3. メンタルケア・行動アドバイス (Screenshot 3のカード) */}
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
        {/* 4. 有料エリア（認知の歪み7パターン詳細分析 ＆ モザイク・ロック） */}
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
    </div>
  );
}
