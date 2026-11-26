'use client';

import React from 'react';
import {
  Brain,
  MessageCircle,
  Activity,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import OwlMascot from '../common/OwlMascot';

export default function MethodologySection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* セクションタイトル */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ココロナビの診断設計と心理学アプローチ</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          なぜ「16タイプ × メンタルヘルス」なのか？
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          一般的な性格診断では見落とされがちな「いまの心の疲労度」や「無意識の認知の歪み（思考の癖）」を組み合わせ、
          あなた本来の特性と現在の心の状態を多角的に紐解きます。
        </p>
      </div>

      {/* 3本柱の解説グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 柱1: 16タイプ性格プロファイリング */}
        <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              1. ユング心理学・MBTIに基づく16タイプ
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              エネルギーの方向（外向/内向）、情報の受け取り方（感覚/直観）、判断基準（思考/感情）、外界への接し方（判断/知覚）の4軸を測定し、あなたの強みや思考傾向を可視化します。
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            💡 <span className="font-semibold text-slate-200">自己理解の土台：</span> 自分の生まれ持った気質や得意な意思決定スタイルを知る。
          </div>
        </div>

        {/* 柱2: 心の疲弊度（ストレス度）測定 */}
        <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              2. 現在のエネルギー残量・メンタル疲弊度
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              性格が同じでも、「心身快調（Lv.1）」のときと「要休息（Lv.5）」のときでは必要なアプローチが異なります。今のエネルギー残量に応じた具体的な休息法を提案します。
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            🌿 <span className="font-semibold text-slate-200">休息の処方箋：</span> 頑張りすぎている自分に気づき、回復のための余白を作る。
          </div>
        </div>

        {/* 柱3: 認知行動療法（CBT）に基づく思考の癖 */}
        <div className="p-5 rounded-3xl bg-[#141A29] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              3. 認知行動療法（CBT）と認知の歪み
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              白黒思考、すべき思考、破局化思考など、ストレス時に強まりやすい7つの思考バイアスをレーダーチャートで可視化。考え方のバランスを取り戻すリフレーミングを伝授します。
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            🧘 <span className="font-semibold text-slate-200">心のストレッチ：</span> 凝り固まった思考パターンをほぐし、生きづらさを和らげる。
          </div>
        </div>
      </div>

      {/* 案内役ミネルヴァの役割と医療的免責事項 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#0C101C] border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <OwlMascot size={56} className="shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-sm font-bold text-white">
              案内役フクロウ「ミネルヴァ」について
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
              ナビゲーター
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            知恵と癒しの象徴であるフクロウの「ミネルヴァ」は、100問の診断中も、結果レポートの中でも、あなたの歩みに温かく寄り添うパートナーです。評価や否定をすることなく、あなたが本来の自分らしく生きるためのヒントを伝えます。
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            ⚠️ <span className="font-semibold text-slate-300">免責事項・注意事項：</span>
            本サービスは心理学・自己啓発の知見に基づく自己分析支援ツールであり、精神医学的な確定診断や治療等の医療行為を行うものではありません。強い精神的苦痛を感じている場合は、専門の医療機関や公的相談窓口をご利用ください。
          </p>
        </div>
      </div>
    </section>
  );
}
