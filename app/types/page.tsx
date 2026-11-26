import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Compass, Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import OwlMascot from '../../components/common/OwlMascot';
import TypeAnimalIcon, { typeAnimalMap } from '../../components/result/TypeAnimalIcon';
import { PERSONALITY_TYPES } from '../../lib/analytics';
import ThemeToggle from '../../components/theme/ThemeToggle';
import LegalFooter from '../../components/common/LegalFooter';

export const metadata: Metadata = {
  title: '16タイプ一覧と心理学解説 | ココロナビ',
  description: 'ユング心理学・MBTIの枠組みに基づく全16タイプの性格特性、強み・弱み、ストレスサイン、認知行動療法（CBT）アプローチを網羅した詳細解説インデックス。',
};

const GROUP_NAMES: Record<string, { label: string; desc: string; icon: string }> = {
  '分析家グループ': {
    label: '思考・分析型（NT型）',
    desc: '知的好奇心と徹底した論理で真理や仕組みを探究するタイプ',
    icon: '🔮',
  },
  '外交官グループ': {
    label: '共感・理想型（NF型）',
    desc: '温かい心と深い共感力で人の絆や理想を大切にするタイプ',
    icon: '🌿',
  },
  '番人グループ': {
    label: '誠実・慎重型（SJ型）',
    desc: '誠実な責任感と秩序を重んじ、周囲の安心と日常を支えるタイプ',
    icon: '🛡️',
  },
  '探検家グループ': {
    label: '自由・行動型（SP型）',
    desc: '柔軟な感性と抜群の行動力で今この瞬間を存分に楽しむタイプ',
    icon: '⚡',
  },
};

export default function TypesIndexPage() {
  const groups = Object.keys(GROUP_NAMES);

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 font-sans pb-16 selection:bg-purple-900 selection:text-purple-200">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>診断トップへ戻る</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity group"
            >
              <OwlMascot size={26} />
              <span className="text-sm font-bold text-white tracking-wide group-hover:text-indigo-300 transition-colors">
                ココロナビ
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* ページタイトル */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>全16タイプ性格プロファイリング・カルテ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            16の心のコンパスとメンタルケア解説
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ココロナビでは、16タイプそれぞれの長所や行動傾向だけでなく、「どんな時にストレスを感じやすいか」「どんな認知の歪み（思考の癖）に陥りやすいか」を丁寧に解説しています。
          </p>
        </div>

        {/* グループ別インデックス一覧 */}
        <div className="space-y-8">
          {groups.map((groupKey) => {
            const groupMeta = GROUP_NAMES[groupKey];
            const typesInGroup = Object.entries(PERSONALITY_TYPES).filter(
              ([_, info]) => info.group === groupKey
            );

            return (
              <section key={groupKey} className="space-y-4">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{groupMeta.icon}</span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {groupMeta.label}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {groupMeta.desc}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {typesInGroup.map(([code, info]) => {
                    const animal = typeAnimalMap[code] || { label: 'マスコット' };
                    return (
                      <Link
                        key={code}
                        href={`/types/${code.toLowerCase()}`}
                        className="group rounded-3xl p-5 bg-[#141A29] border border-slate-800 hover:border-indigo-500/60 transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                              <TypeAnimalIcon type={code} size={48} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-base font-extrabold text-white">
                                  {code}
                                </span>
                                <span className="text-xs font-bold text-indigo-300">
                                  {info.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {animal.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 line-clamp-1 pt-0.5">
                                {info.catchphrase}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {info.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {info.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                          <span>詳細解説を読む</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* 下部CTA */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0C101C] border border-indigo-500/40 text-center space-y-4">
          <OwlMascot size={40} className="mx-auto" />
          <h3 className="text-lg sm:text-xl font-bold text-white">
            100問の対話で、あなた自身のタイプと心の状態を精密測定
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            登録不要・完全無料。知恵のフクロウ「ミネルヴァ」と一緒に、あなただけの心の地図を見つけにいきましょう。
          </p>
          <div className="pt-1">
            <Link
              href="/?mode=chat"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-950 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>今すぐ無料で診断する</span>
            </Link>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
