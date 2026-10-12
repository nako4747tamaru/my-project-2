'use client';

import React, { useState, useMemo } from 'react';
import {
  Lock,
  Sparkles,
  Heart,
  ShieldCheck,
  Activity,
  Compass,
  Brain,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Smile,
  Share2,
  RotateCcw,
  Check,
  Coffee,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

import { QUESTIONS as defaultQuestions } from '../../lib/questions';
import {
  calculatePersonality,
  PersonalityResult,
  Answers,
  DistortionScoreItem,
  Question,
} from '../../lib/personality';

export interface ResultScreenProps {
  /** ユーザーの回答（質問ID -> 1〜5の選択値） */
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
  /** 既に有料会員であるかどうかのフラグ（初期値: false） */
  isPremiumUnlocked?: boolean;
}

/**
 * テスト表示用・未回答時のデフォルト回答サンプル生成
 * （バランスのとれたINFP系＋中度疲弊＋白黒思考・すべき思考傾向のリアルなサンプル）
 */
function createSampleAnswers(questionsList: Question[] = defaultQuestions): Answers {
  const sample: Answers = {};
  questionsList.forEach((q, idx) => {
    const key = q.id ?? idx + 1;
    let val = 3;
    if (q.dim === 'EI') {
      val = q.pole === 'I' ? 4 : 2;
    } else if (q.dim === 'SN') {
      val = q.pole === 'N' ? 4 : 2;
    } else if (q.dim === 'TF') {
      val = q.pole === 'F' ? 5 : 2;
    } else if (q.dim === 'JP') {
      val = q.pole === 'P' ? 4 : 2;
    } else if (q.dim === 'fatigue') {
      val = (idx % 3) + 2;
    } else if (q.dim === 'all-or-nothing' || q.dim === 'should') {
      val = 4;
    } else {
      val = 3;
    }
    sample[key] = val;
    sample[idx] = val;
  });
  return sample;
}

export default function ResultScreen({
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

  // 有料プラン解放状態のローカル管理（プレビュー解除も可能）
  const [unlocked, setUnlocked] = useState(isPremiumUnlocked);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'workbook'>('overview');
  const [openWorkIndex, setOpenWorkIndex] = useState<number | null>(0);

  // Stripe決済ボタンハンドラー
  const handleCheckout = () => {
    if (onUnlockPremium) {
      onUnlockPremium();
    } else {
      // コールバック未指定時はデモとして解放
      setUnlocked(true);
    }
  };

  // シェア機能
  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    const text = `【Kokoro Navi 診断結果】\n私の性格タイプは「${result.type} - ${result.title}」でした！\nメンタル疲弊度: レベル${result.fatigue.level} (${result.fatigue.status})\n#KokoroNavi #性格診断 #メンタルヘルス`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 疲弊度に応じたカラー・バッジスタイル
  const getFatigueColorStyle = (level: number) => {
    switch (level) {
      case 1:
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'from-emerald-400 to-teal-500',
          meter: 'bg-emerald-500',
          icon: 'text-emerald-500',
          bgLight: 'bg-emerald-50/60',
        };
      case 2:
        return {
          badge: 'bg-teal-50 text-teal-700 border-teal-200',
          accent: 'from-teal-400 to-cyan-500',
          meter: 'bg-teal-500',
          icon: 'text-teal-500',
          bgLight: 'bg-teal-50/60',
        };
      case 3:
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          accent: 'from-amber-400 to-yellow-500',
          meter: 'bg-amber-500',
          icon: 'text-amber-500',
          bgLight: 'bg-amber-50/60',
        };
      case 4:
        return {
          badge: 'bg-orange-50 text-orange-800 border-orange-200',
          accent: 'from-orange-400 to-amber-500',
          meter: 'bg-orange-500',
          icon: 'text-orange-500',
          bgLight: 'bg-orange-50/60',
        };
      case 5:
      default:
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          accent: 'from-rose-400 to-red-500',
          meter: 'bg-rose-500',
          icon: 'text-rose-500',
          bgLight: 'bg-rose-50/60',
        };
    }
  };

  const fatigueStyle = getFatigueColorStyle(result.fatigue.level);

  // 最も顕著な歪み（Top 1）
  const topDistortion = result.topDistortions[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fa] via-[#f1f6f8] to-[#fbf8f5] text-slate-700 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-teal-100 selection:text-teal-900">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* --- ヘッダー --- */}
        <header className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50/80 border border-teal-200/70 text-teal-800 text-xs sm:text-sm font-medium tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>Kokoro Navi 100問 総合心理・性格診断レポート</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
            あなたの心と性格のカルテ
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            100の問いから紡ぎ出された、今のあなたの性格特性とメンタルの現在地です。自分を優しく見つめ直すヒントとしてご活用ください。
          </p>
        </header>

        {/* ======================================================== */}
        {/* 【無料エリア（全体公開）】 */}
        {/* ======================================================== */}
        <section className="space-y-8">

          {/* 1. MBTI 16タイプカード */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl border border-sky-100/90 shadow-xl shadow-slate-200/50 p-6 sm:p-9 transition-all">
            {/* 上部ラベル */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm">
                <Compass className="w-5 h-5 text-sky-500" />
                <span>パーソナリティ特性（MBTI分析）</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200/60">
                <span>全体公開・無料</span>
              </div>
            </div>

            {/* タイプ名称 & キャッチフレーズ */}
            <div className="mt-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-teal-50/50 to-indigo-50 border border-sky-100 shadow-inner w-36 h-36 shrink-0">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                  TYPE
                </span>
                <span className="text-4xl font-black tracking-wider bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  {result.type}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1">
                  {result.axes.EI.primary === 'E' ? '外向型' : '内向型'}
                </span>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-semibold text-teal-600 tracking-wide">
                    {result.catchphrase}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    {result.title}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {result.description}
                </p>

                {/* 強みタグ */}
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {result.strengths.slice(0, 3).map((strength, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-teal-50/70 text-teal-800 border border-teal-100/80 font-medium"
                    >
                      <Check className="w-3 h-3 text-teal-600" />
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4軸の傾向バランス（プログレスバー表示） */}
            <div className="mt-9 pt-7 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <span>4つの心理機能バランス（傾向メーター）</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 軸1: EI (外向 vs 内向) */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={result.axes.EI.primary === 'E' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      外向性 (E): {result.axes.EI.percentageA}%
                    </span>
                    <span className={result.axes.EI.primary === 'I' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      内向性 (I): {result.axes.EI.percentageB}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-teal-400 transition-all duration-700"
                      style={{ width: `${result.axes.EI.percentageA}%` }}
                    />
                    <div
                      className="bg-sky-500 transition-all duration-700"
                      style={{ width: `${result.axes.EI.percentageB}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>人との交流で充電</span>
                    <span>一人の内省で充電</span>
                  </p>
                </div>

                {/* 軸2: SN (感覚 vs 直観) */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={result.axes.SN.primary === 'S' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      感覚 (S): {result.axes.SN.percentageA}%
                    </span>
                    <span className={result.axes.SN.primary === 'N' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      直観 (N): {result.axes.SN.percentageB}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-teal-400 transition-all duration-700"
                      style={{ width: `${result.axes.SN.percentageA}%` }}
                    />
                    <div
                      className="bg-indigo-400 transition-all duration-700"
                      style={{ width: `${result.axes.SN.percentageB}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>現実・具体的な事実</span>
                    <span>未来・可能性と直感</span>
                  </p>
                </div>

                {/* 軸3: TF (思考 vs 感情) */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={result.axes.TF.primary === 'T' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      思考 (T): {result.axes.TF.percentageA}%
                    </span>
                    <span className={result.axes.TF.primary === 'F' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      感情 (F): {result.axes.TF.percentageB}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-cyan-500 transition-all duration-700"
                      style={{ width: `${result.axes.TF.percentageA}%` }}
                    />
                    <div
                      className="bg-rose-400 transition-all duration-700"
                      style={{ width: `${result.axes.TF.percentageB}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>論理・客観的合理性</span>
                    <span>共感・価値観と調和</span>
                  </p>
                </div>

                {/* 軸4: JP (判断 vs 知覚) */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={result.axes.JP.primary === 'J' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      判断 (J): {result.axes.JP.percentageA}%
                    </span>
                    <span className={result.axes.JP.primary === 'P' ? 'text-teal-700 font-bold' : 'text-slate-500'}>
                      知覚 (P): {result.axes.JP.percentageB}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-emerald-400 transition-all duration-700"
                      style={{ width: `${result.axes.JP.percentageA}%` }}
                    />
                    <div
                      className="bg-amber-400 transition-all duration-700"
                      style={{ width: `${result.axes.JP.percentageB}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex justify-between">
                    <span>計画的・秩序を重視</span>
                    <span>柔軟・臨機応変を好む</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. メンタル疲弊度メーターカード */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-100/90 shadow-xl shadow-slate-200/50 p-6 sm:p-9 transition-all">
            {/* 上部ヘッダー */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <Heart className="w-5 h-5 text-amber-600" />
                <span>メンタル疲弊度・ストレス測定</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/60">
                <span>全体公開・無料</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* レベル表示 & ゲージ */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${fatigueStyle.badge}`}>
                      Level {result.fatigue.level} / 5
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-slate-800">
                      {result.fatigue.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    疲弊スコア: {result.fatigue.score} / {result.fatigue.maxScore} 点
                  </p>
                </div>

                {/* 5段階の視覚的ステップゲージ */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const isActive = lvl <= result.fatigue.level;
                    const isCurrent = lvl === result.fatigue.level;
                    return (
                      <div
                        key={lvl}
                        className="flex-1 sm:w-11 flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`h-3 w-full rounded-full transition-all duration-500 ${
                            isActive
                              ? isCurrent
                                ? `bg-gradient-to-r ${fatigueStyle.accent} ring-2 ring-offset-2 ring-amber-300 shadow-sm`
                                : 'bg-slate-300'
                              : 'bg-slate-150 bg-slate-200/70'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold ${
                            isCurrent ? 'text-slate-800 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Lv.{lvl}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 寄り添う温かいメッセージカード */}
              <div className={`rounded-2xl p-5 sm:p-6 border border-slate-100 ${fatigueStyle.bgLight} space-y-3`}>
                <div className="flex items-start gap-3">
                  <Smile className={`w-5 h-5 shrink-0 mt-0.5 ${fatigueStyle.icon}`} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      今のあなたへ、こころの処方箋メッセージ
                    </h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                      {result.fatigue.message}
                    </p>
                  </div>
                </div>

                {/* セルフケアのヒント */}
                <div className="pt-3 border-t border-slate-200/50">
                  <h5 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>今日できる手軽な充電アクション</span>
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.fatigue.careAdvice.map((advice, i) => (
                      <li
                        key={i}
                        className="text-xs bg-white/80 p-2.5 rounded-xl border border-slate-100/80 text-slate-600 flex items-start gap-1.5"
                      >
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 【有料エリア（モザイク・ロック表示）】 */}
        {/* ======================================================== */}
        <section className="relative">
          {/* 有料エリアのコンテナ */}
          <div
            className={`rounded-3xl border border-indigo-100/90 bg-white/95 shadow-xl shadow-slate-200/50 p-6 sm:p-9 transition-all relative overflow-hidden ${
              !unlocked ? 'select-none' : ''
            }`}
          >
            {/* 上部ヘッダー */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                <Brain className="w-5 h-5 text-indigo-500" />
                <span>【深層分析】認知の歪み ＆ パーソナライズ対話ワーク</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-rose-50 text-amber-900 text-xs font-bold border border-amber-200/70 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{unlocked ? '解放済み（プレミアム）' : 'プレミアム限定機能'}</span>
              </div>
            </div>

            {/* 有料コンテンツ本体（未解放時はblurがかかる） */}
            <div
              className={`space-y-8 mt-6 transition-all duration-300 ${
                !unlocked ? 'filter blur-[5px] pointer-events-none opacity-60' : ''
              }`}
            >
              {/* 1. 認知の歪み 7パターンの詳細分析 */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span>認知の歪み 7項目プロファイリング</span>
                      <span className="text-xs font-normal text-slate-500">
                        （全25問の回答から算出）
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      あなたがストレスや不安を感じたときに陥りやすい「無意識の思考パターン」です。
                    </p>
                  </div>
                  {topDistortion && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold self-start sm:self-auto">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>最も強い傾向: {topDistortion.shortName}</span>
                    </div>
                  )}
                </div>

                {/* 歪み項目のグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.distortions.map((d: DistortionScoreItem) => {
                    const isTop = d.type === topDistortion?.type;
                    return (
                      <div
                        key={d.type}
                        className={`p-4 rounded-2xl border transition-all ${
                          isTop
                            ? 'bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 border-rose-200 shadow-sm'
                            : 'bg-slate-50/70 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">
                              {d.name}
                            </span>
                            {isTop && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                                要注意
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-extrabold ${
                              d.severity === 'high'
                                ? 'text-rose-600'
                                : d.severity === 'medium'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {d.percentage}%
                          </span>
                        </div>

                        {/* プログレスバー */}
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2.5">
                          <div
                            className={`h-full transition-all duration-700 ${
                              d.severity === 'high'
                                ? 'bg-gradient-to-r from-orange-400 to-rose-500'
                                : d.severity === 'medium'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                            }`}
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {d.explanation}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span>口癖例: {d.catchphrase}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. パーソナライズ対話ワーク＆セルフケアガイド */}
              <div className="pt-6 border-t border-slate-100 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span>あなた専用の認知行動療法（CBT）セルフケアワーク</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    最もスコアの高かった思考の癖「{topDistortion?.name}」を無理なく緩めるための3ステップワークシートです。
                  </p>
                </div>

                {/* 3ステップワークシート */}
                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="bg-gradient-to-r from-indigo-50/70 to-sky-50/50 rounded-2xl p-4 sm:p-5 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <h4 className="text-sm font-bold text-indigo-950">
                        自動思考のキャッチ（気づくワーク）
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                      心がざわついた時、頭に浮かんだ言葉をそのまま書き留めます。「あ、今{topDistortion?.shortName}のフィルターが発動しているな」と実況中継のように客観視してみましょう。
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-gradient-to-r from-teal-50/70 to-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-teal-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <h4 className="text-sm font-bold text-teal-950">
                        リフレーミングの問いかけ（視点を広げる）
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                      自分自身にこう問いかけてみてください：<br />
                      <span className="font-semibold text-teal-900 bg-white/70 px-2 py-0.5 rounded inline-block mt-1 border border-teal-100">
                        {topDistortion?.reframingQuestion}
                      </span>
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/50 rounded-2xl p-4 sm:p-5 border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <h4 className="text-sm font-bold text-amber-950">
                        今日からできる小さな処方箋アクション
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                      {topDistortion?.actionTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* 【Stripe決済への導線（モザイク・オーバーレイ）】 */}
            {/* ---------------------------------------------------- */}
            {!unlocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-white/70 via-white/85 to-white/95 backdrop-blur-md">
                <div className="max-w-md w-full text-center space-y-5 bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-100/90 relative">
                  {/* 鍵バッジ */}
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                    <Lock className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>プレミアムレポート限定</span>
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      あなたの心の癖と解決ワークを完全解放
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      認知の歪み全7項目の詳細スコアと、臨床心理アプローチに基づくパーソナライズ対話ワークで、日々の不安や息苦しさを軽くします。
                    </p>
                  </div>

                  {/* 特典リスト */}
                  <ul className="text-left space-y-2.5 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>白黒思考やすべき思考など「7つの認知の歪み」完全数値化</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>あなたの思考癖に特化した「パーソナライズ対話ワークシート」</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>MBTIタイプ × 疲弊度を掛け合わせた深層アドバイス</span>
                    </li>
                  </ul>

                  {/* CTAボタン */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-white text-sm sm:text-base bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-600 hover:via-emerald-600 hover:to-teal-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/25 cursor-pointer"
                    >
                      <Lock className="w-5 h-5 shrink-0" />
                      <span>月額980円で詳細分析と解決ワークを解放する</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        Stripe安全決済
                      </span>
                      <span>•</span>
                      <span>いつでも解約可能</span>
                      <span>•</span>
                      <span>追加料金なし</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- フッター操作（再診断・シェア・注意書き） --- */}
        <footer className="space-y-6 pt-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>{copied ? '結果をクリップボードにコピーしました！' : '診断結果をシェアする'}</span>
            </button>

            {onRetest && (
              <button
                type="button"
                onClick={onRetest}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>もう一度診断する</span>
              </button>
            )}
          </div>

          <div className="max-w-xl mx-auto text-center space-y-1 text-xs text-slate-400 leading-relaxed">
            <p>
              ※ 本診断は心理統計に基づく自己理解のためのツールであり、医学的な診断や治療を代替するものではありません。
            </p>
            <p>
              深刻な心身の不調が続く場合は、無理をなさらず専門の医療機関やカウンセラーにご相談ください。
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
