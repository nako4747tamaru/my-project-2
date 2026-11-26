'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  Search,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import TypeAnimalIcon, { typeAnimalMap } from '../result/TypeAnimalIcon';
import { PERSONALITY_TYPES, PersonalityTypeInfo } from '../../lib/analytics';
import TypeDetailModal from './TypeDetailModal';

interface TypeLandingSectionProps {
  onStartDiagnosis: () => void;
  onPreviewType?: (typeCode: string) => void;
}

// 4大グループの定義・バッジ色・説明
const GROUP_CONFIG: Record<
  string,
  {
    name: string;
    alias: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    accentBorder: string;
    gradientBg: string;
    icon: string;
  }
> = {
  all: {
    name: 'すべて',
    alias: 'ALL',
    description: '全16タイプ',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    accentBorder: 'border-indigo-500/40',
    gradientBg: 'from-indigo-600/20 to-purple-600/20',
    icon: '✨',
  },
  '分析家グループ': {
    name: '思考・分析型',
    alias: '分析家',
    description: '知的好奇心と徹底した論理で真理や仕組みを探究するタイプ',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    accentBorder: 'border-purple-500/40',
    gradientBg: 'from-purple-900/30 via-slate-900/60 to-slate-950/80',
    icon: '🔮',
  },
  '外交官グループ': {
    name: '共感・理想型',
    alias: '外交官',
    description: '温かい心と深い共感力で人の絆や理想を大切にするタイプ',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/40',
    gradientBg: 'from-emerald-900/30 via-slate-900/60 to-slate-950/80',
    icon: '🌿',
  },
  '番人グループ': {
    name: '誠実・慎重型',
    alias: '番人',
    description: '誠実な責任感と秩序を重んじ、周囲の安心と日常を支えるタイプ',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    accentBorder: 'border-blue-500/40',
    gradientBg: 'from-blue-900/30 via-slate-900/60 to-slate-950/80',
    icon: '🛡️',
  },
  '探検家グループ': {
    name: '自由・行動型',
    alias: '探検家',
    description: '柔軟な感性と抜群の行動力で今この瞬間を存分に楽しむタイプ',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    accentBorder: 'border-amber-500/40',
    gradientBg: 'from-amber-900/30 via-slate-900/60 to-slate-950/80',
    icon: '⚡',
  },
};

export default function TypeLandingSection({
  onStartDiagnosis,
  onPreviewType,
}: TypeLandingSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTypeCode, setSelectedTypeCode] = useState<string | null>(null);

  const handleOpenDetail = (code: string) => {
    setSelectedTypeCode(code);
    setDetailModalOpen(true);
  };

  const typeEntries = Object.entries(PERSONALITY_TYPES);

  // フィルタリング
  const filteredTypes = typeEntries.filter(([typeCode, info]) => {
    const matchesGroup = selectedGroup === 'all' || info.group === selectedGroup;
    if (!matchesGroup) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const animal = typeAnimalMap[typeCode]?.label || '';
    return (
      typeCode.toLowerCase().includes(query) ||
      info.name.toLowerCase().includes(query) ||
      info.catchphrase.toLowerCase().includes(query) ||
      info.tags.some((t) => t.toLowerCase().includes(query)) ||
      animal.toLowerCase().includes(query)
    );
  });

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* ヒーロー紹介バナー */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-[#0C101C] border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>案内役ミネルヴァが紹介する全16タイプ</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              あなたの本当の性格はどのタイプ？<br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                ミネルヴァが導く16の心のコンパス
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              知恵のフクロウ「ミネルヴァ」が、各タイプの個性や心の活かし方を丁寧にサポート。16タイプ診断に加え、「心の疲弊度」や「無意識の思考の癖」まで詳細にガイドします。
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={onStartDiagnosis}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/60 hover:shadow-indigo-800/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>今すぐ自分のタイプを診断する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              ✨ 登録不要・完全無料で診断スタート
            </span>
          </div>
        </div>
      </div>

      {/* 4大グループ切り替えタブ ＆ 検索バー */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* グループ選択ピルタブ */}
          <div className="flex overflow-x-auto pb-1 sm:pb-0 gap-1.5 scrollbar-none">
            {Object.entries(GROUP_CONFIG).map(([key, cfg]) => {
              const isSelected = selectedGroup === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedGroup(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-md'
                      : 'bg-[#141A29]/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* 検索インプット */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タイプ名・動物・特徴で検索..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141A29] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* 選択中グループの補足説明 */}
        {selectedGroup !== 'all' && (
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <span className="text-base">{GROUP_CONFIG[selectedGroup]?.icon}</span>
            <span className="font-semibold text-white">
              {GROUP_CONFIG[selectedGroup]?.name}:
            </span>
            <span>{GROUP_CONFIG[selectedGroup]?.description}</span>
          </div>
        )}
      </div>

      {/* タイプカードグリッド (2列〜3列レスポンシブ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredTypes.map(([typeCode, info]) => {
          const groupCfg = GROUP_CONFIG[info.group] || GROUP_CONFIG['分析家グループ'];
          const animal = typeAnimalMap[typeCode] || { label: 'マスコット' };

          return (
            <div
              key={typeCode}
              className={`group relative rounded-3xl p-5 bg-[#141A29] border border-slate-800 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between overflow-hidden`}
            >
              {/* カード背景の薄いグラデーション */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${groupCfg.gradientBg} opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10 space-y-3.5">
                {/* ヘッダー: アイコン ＆ タイプ名 ＆ グループバッジ */}
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 animal-avatar-box border border-slate-700/80 p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <TypeAnimalIcon type={typeCode} size={56} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-base font-extrabold text-white tracking-wider">
                        {typeCode}
                      </span>
                      <span className="text-sm font-bold text-indigo-300">
                        {info.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-current/20 ${groupCfg.badgeBg} ${groupCfg.badgeText}`}
                      >
                        {animal.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-300 line-clamp-1">
                      {info.catchphrase}
                    </p>
                  </div>
                </div>

                {/* 説明テキスト */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {info.description}
                </p>

                {/* ミネルヴァからのワンポイントサポート */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                  <span className="text-sm shrink-0">🦉</span>
                  <div className="leading-snug">
                    <span className="font-bold text-indigo-300">ミネルヴァの一言: </span>
                    <span className="text-slate-300 line-clamp-1">{info.growthAdvice}</span>
                  </div>
                </div>

                {/* 特徴タグリスト */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {info.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* カード下部アクションボタン */}
              <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={onStartDiagnosis}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>このタイプか診断する</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenDetail(typeCode)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                  title="このタイプの詳しい解説・ストレスサインを見る"
                >
                  解説
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-300">
            該当するタイプが見つかりませんでした
          </p>
          <p className="text-xs text-slate-500">
            検索キーワードを変えてお試しいただくか、「すべて」を選択してください。
          </p>
        </div>
      )}

      {/* セクション下部 CTA バナー */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-500/30 text-center space-y-4 shadow-xl bottom-cta-banner transition-all relative overflow-hidden">
        {/* 背景の淡いパステルアクセント */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-pink-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold bottom-cta-badge">
            <Sparkles className="w-3.5 h-3.5" />
            <span>さあ、本当のあなたを見つけよう</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white bottom-cta-title">
            あなたのタイプはどれ？ 約100問の対話で精密プロファイリング
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed bottom-cta-desc">
            途中で中断しても自動保存されるため、いつでも再開できます。
            あなたのペースで心地よく心の探検をはじめましょう。
          </p>
          <div className="pt-2">
            <button
              onClick={onStartDiagnosis}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/60 transition-all transform hover:scale-105 active:scale-100 inline-flex items-center gap-2 cursor-pointer bottom-cta-button"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>今すぐ診断をはじめる（無料）</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 16タイプ詳細解説モーダル */}
      <TypeDetailModal
        isOpen={detailModalOpen}
        typeCode={selectedTypeCode}
        typeInfo={selectedTypeCode ? PERSONALITY_TYPES[selectedTypeCode] : null}
        onClose={() => setDetailModalOpen(false)}
        onStartDiagnosis={onStartDiagnosis}
        onPreviewResult={onPreviewType}
      />
    </section>
  );
}
