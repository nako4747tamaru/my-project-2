'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  FileSpreadsheet,
  MessageCircleHeart,
  Clock,
  X,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import OwlMascot from '../common/OwlMascot';

interface FeatureCard {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
}

export default function ComingSoonSection() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);

  const features: FeatureCard[] = [
    {
      id: 'compatibility',
      badge: '近日公開',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      title: '16タイプ相性診断',
      subtitle: '気になるあの人や友人との関係性を深掘り',
      desc: 'お互いの16タイプと認知の傾向を掛け合わせ、すれ違いやすい地雷ポイントや居心地の良い付き合い方をナビゲートします。',
      icon: <Heart className="w-5 h-5 text-rose-300" />,
      bgGradient: 'from-rose-950/30 via-slate-900/60 to-purple-950/20',
      borderColor: 'border-rose-500/30 hover:border-rose-400/60',
    },
    {
      id: 'karte',
      badge: 'COMING SOON',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      title: 'プレミアム詳細カルテ',
      subtitle: '心のログを蓄積＆長期メンタルトラッキング',
      desc: '過去の診断履歴とストレス指数の推移をグラフで可視化。生活リズムや季節ごとの心の変化を把握できる、一生モノの自分カルテ。',
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-300" />,
      bgGradient: 'from-amber-950/30 via-slate-900/60 to-indigo-950/20',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
    },
    {
      id: 'ai-chat',
      badge: '開発中',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
      title: 'ナビと話せるAIメンタル相談',
      subtitle: '夜遅くのモヤモヤも、フクロウのナビが寄り添う',
      desc: '認知行動療法のフレームワークを搭載したフクロウのナビが、24時間いつでもあなたの不安や自己否定の感情を優しく解きほぐします。',
      icon: <MessageCircleHeart className="w-5 h-5 text-teal-300" />,
      bgGradient: 'from-teal-950/30 via-slate-900/60 to-slate-900/40',
      borderColor: 'border-teal-500/30 hover:border-teal-400/60',
    },
  ];

  return (
    <section className="w-full max-w-2xl mx-auto my-8 px-4">
      <div className="rounded-3xl bg-gradient-to-b from-[#182038]/95 to-[#101424]/95 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* 背景の装飾パステルオーラ */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-950">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  今後のアップデート予定
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Coming Soon
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ココロナビは、あなたの心に寄り添う新機能を順次拡張予定です🌿
              </p>
            </div>
          </div>
        </div>

        {/* 機能カードリスト */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              type="button"
              className={`rounded-2xl p-4 text-left border bg-gradient-to-b ${feature.bgGradient} ${feature.borderColor} transition-all duration-200 hover:-translate-y-0.5 shadow-lg group cursor-pointer relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 transition-colors mb-1 line-clamp-1">
                  {feature.title}
                </h4>

                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                  {feature.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300/90 pt-1 border-t border-slate-700/40">
                <Clock className="w-3 h-3" />
                <span>準備中（詳細を見る）</span>
                <ChevronRight className="w-3 h-3 ml-auto transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 準備中モーダルポップアップ */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 bg-[#0C101C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#1C253D] to-[#141A29] border border-indigo-400/40 rounded-3xl p-6 max-w-sm w-full text-left shadow-2xl relative space-y-4">
            {/* 閉じるボタン */}
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* モーダルヘッダー */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                <OwlMascot size={36} />
              </div>
              <div>
                <span
                  className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border mb-1 ${selectedFeature.badgeColor}`}
                >
                  {selectedFeature.badge}
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {selectedFeature.title}
                </h4>
              </div>
            </div>

            {/* モーダル本文 */}
            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-700/60 space-y-2">
              <p className="text-xs font-semibold text-indigo-200">
                {selectedFeature.subtitle}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedFeature.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl p-2.5">
              <BellRing className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                現在鋭意開発中です！正式リリース時にいち早くお届けできるよう準備を進めています🍀
              </span>
            </div>

            {/* 閉じるCTA */}
            <button
              onClick={() => setSelectedFeature(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              楽しみに待つ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
