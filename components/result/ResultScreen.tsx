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

  // シェア機能
  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    const text = `【ココロナビ 16タイプ診断結果】\n${userName}さんの診断タイプは「${result.type} - ${result.info.shortName || result.title}」でした！\nメンタル疲弊度: ${result.fatigue.title} (${result.fatigue.level}/5)\n#ココロナビ #16タイプ診断 #メンタルヘルス`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

          {/* シェアボタン */}
          <div className="mt-6">
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#5558E6] hover:to-[#6D28D9] active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>クリップボードにコピーしました！</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>結果をシェアする</span>
                </>
              )}
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
        {/* 4. 有料エリア（認知の歪み詳細分析 ＆ モザイク・ロック） */}
        {/* ======================================================== */}
        <section className="relative rounded-3xl bg-gradient-to-b from-[#181F33] to-[#121625] border border-slate-700/60 p-5 sm:p-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">認知の歪み詳細分析 ＆ 解決ワーク</h3>
            </div>
            {!unlocked && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                PREMIUM
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-4">
            物事の捉え方の癖（認知の歪み5パターン）を数値化し、心を楽にするためのセルフケアワークシートを提供します。
          </p>

          {/* 歪みスコア一覧（ロック時はぼかし表示） */}
          <div className={`space-y-3 transition-all ${!unlocked ? 'filter blur-[5px] select-none pointer-events-none' : ''}`}>
            {result.distortions.map((d: DistortionScoreItem) => {
              const isTop = d.type === topDistortion?.type;
              return (
                <div
                  key={d.type}
                  className={`p-3.5 rounded-2xl border ${
                    isTop
                      ? 'bg-[#24213D] border-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{d.name}</span>
                      {isTop && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-300 font-bold">
                          要注意
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-300">
                      {d.percentage}%
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {d.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ロックオーバーレイ */}
          {!unlocked && (
            <div className="absolute inset-0 bg-[#0C101C]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/50 mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>

              <h4 className="text-base font-bold text-white mb-1">
                思考の癖を解きほぐす完全レポート
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
                最もスコアの高かった「{topDistortion?.name}」の対処法と、認知行動療法（CBT）に基づいた対話ワークシートを解放します。
              </p>

              <button
                onClick={handleCheckout}
                className="w-full max-w-xs flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-950/60 transition-transform active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>月額980円で詳細分析と解決ワークを解放する</span>
              </button>

              <button
                onClick={() => setUnlocked(true)}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                プレビュー（デモ解放）
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
