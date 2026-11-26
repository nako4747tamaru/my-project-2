import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Heart,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import OwlMascot from '../../../components/common/OwlMascot';
import TypeAnimalIcon, { typeAnimalMap } from '../../../components/result/TypeAnimalIcon';
import { PERSONALITY_TYPES } from '../../../lib/analytics';
import ThemeToggle from '../../../components/theme/ThemeToggle';
import LegalFooter from '../../../components/common/LegalFooter';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  return Object.keys(PERSONALITY_TYPES).map((code) => ({
    code: code.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const code = resolved.code.toUpperCase();
  const info = PERSONALITY_TYPES[code];
  if (!info) {
    return { title: 'タイプが見つかりません | ココロナビ' };
  }

  const title = `【${code}（${info.name}）の性格とメンタルケア解説】強み・弱み・ストレスサイン | ココロナビ`;
  const description = `16タイプ性格診断における${code}（${info.name}）の詳しい解説。${info.catchphrase}。本来の強み、陥りやすい弱点、ストレス時の危険信号と認知行動療法アプローチ。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function TypeDetailPage({ params }: Props) {
  const resolved = await params;
  const code = resolved.code.toUpperCase();
  const info = PERSONALITY_TYPES[code];

  if (!info) {
    notFound();
  }

  const animal = typeAnimalMap[code] || { label: 'マスコット' };

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 font-sans pb-16 selection:bg-purple-900 selection:text-purple-200">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/types"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>16タイプ一覧へ</span>
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* パンくずリスト */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            トップ
          </Link>
          <span>/</span>
          <Link href="/types" className="hover:text-slate-200">
            16タイプ一覧
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-bold">{code}</span>
        </nav>

        {/* ヒーローカード */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/70 via-[#182033] to-[#101422] border border-indigo-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-slate-900/90 border border-slate-700/80 p-1.5 flex items-center justify-center shadow-inner shrink-0">
              <TypeAnimalIcon type={code} size={84} priority />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                  {code}
                </span>
                <span className="text-lg sm:text-xl font-bold text-indigo-300">
                  {info.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {animal.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                  {info.group}
                </span>
              </div>

              <p className="text-sm font-bold text-slate-200">
                「{info.catchphrase}」
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                {info.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 性格と行動の特性 */}
        <section className="space-y-3 bg-[#141A29] border border-slate-800 rounded-3xl p-6 sm:p-7">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>{code}（{info.name}）の基本性格と行動特性</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {info.description}
          </p>
        </section>

        {/* 強みと弱み */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[#141A29] border border-emerald-500/30 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>本来備わっている強み</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-300">
              {info.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✔</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-[#141A29] border border-rose-500/30 space-y-3">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>注意したい弱点・つまずき</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-300">
              {info.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">▲</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ストレスと心の疲弊サイン */}
        <section className="p-6 rounded-3xl bg-[#141A29] border border-amber-500/30 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>心が疲れているときの危険サイン（SOS信号）</span>
            </h2>
            <p className="text-xs text-slate-400">
              {code}タイプは無理を重ねると、以下のような特有のストレス反応が現れやすくなります。
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {info.stressSignals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-200"
              >
                <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                <span className="leading-relaxed">{sig}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 認知の歪み（思考の癖）と処方箋 */}
        {info.stressPatterns && info.stressPatterns.length > 0 && (
          <section className="p-6 rounded-3xl bg-[#141A29] border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-purple-300 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>陥りやすい思考の癖（認知行動療法アプローチ）</span>
              </h2>
              <p className="text-xs text-slate-400">
                ストレス下で起きる思考バイアスと、その重荷をほぐす問いかけ（リフレーミング）です。
              </p>
            </div>
            <div className="space-y-3">
              {info.stressPatterns.map((pat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0C101C]/70 border border-slate-800 space-y-2"
                >
                  <p className="text-xs font-bold text-rose-300">
                    悩みのパターン: {pat.title}
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
                    💡 <span className="font-bold">ミネルヴァの思考処方箋：</span>
                    {pat.advice}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ミネルヴァからの成長・セルフケア助言 */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-[#0C101C] border border-indigo-500/40 space-y-3">
          <div className="flex items-center gap-2.5">
            <OwlMascot size={32} />
            <h2 className="text-base font-bold text-indigo-300">
              案内役ミネルヴァより：{code}のあなたへ贈るメッセージ
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-1">
            {info.growthAdvice}
          </p>
        </section>

        {/* 診断へ誘導するボトムカード */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#141A29] border border-indigo-500/30 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">
            あなた自身をより深く知る、100問のメンタル・性格診断
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            所要時間約10分。性格タイプだけでなく、いまの心の疲弊度や思考の癖まで精密に可視化します。
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/?mode=chat"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-950 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>今すぐ無料で診断を始める</span>
            </Link>
            <Link
              href={`/result?type=${code}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <span>{code}の診断結果サンプルを見る</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
