'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  Heart,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Activity,
  Layers,
} from 'lucide-react';
import { PersonalityTypeInfo } from '../../lib/analytics';
import TypeAnimalIcon, { typeAnimalMap } from '../result/TypeAnimalIcon';
import OwlMascot from '../common/OwlMascot';

interface TypeDetailModalProps {
  typeCode: string | null;
  typeInfo: PersonalityTypeInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDiagnosis: () => void;
  onPreviewResult?: (typeCode: string) => void;
}

export default function TypeDetailModal({
  typeCode,
  typeInfo,
  isOpen,
  onClose,
  onStartDiagnosis,
  onPreviewResult,
}: TypeDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !typeCode || !typeInfo) return null;

  const animal = typeAnimalMap[typeCode] || { label: 'マスコット' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* 背景クリックで閉じる */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#141A29] dark:bg-[#141A29] border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#0C101C]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <OwlMascot size={28} />
            <div>
              <span className="text-xs font-bold text-indigo-400 block leading-tight">
                ミネルヴァの性格タイプカルテ
              </span>
              <span className="text-sm font-extrabold text-white">
                {typeCode}（{typeInfo.name}）の詳しい解説
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スクロール可能本文 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ヒーローカード */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-[#0C101C] border border-indigo-500/30 flex items-start gap-4">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-slate-900/90 border border-slate-700/80 p-1 flex items-center justify-center shadow-inner">
              <TypeAnimalIcon type={typeCode} size={70} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-black text-white tracking-wider">
                  {typeCode}
                </span>
                <span className="text-base font-bold text-indigo-300">
                  {typeInfo.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {animal.label}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">
                「{typeInfo.catchphrase}」
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {typeInfo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 基本的な性格・特徴 */}
          <section className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>性格特性と行動パターン</span>
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed bg-[#0C101C]/60 p-3.5 rounded-xl border border-slate-800/60">
              {typeInfo.description}
            </p>
          </section>

          {/* 強みと弱みの2カラム */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>本来備わっている強み</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {typeInfo.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">・</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>陥りやすい弱点・つまずき</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {typeInfo.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">・</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 心が疲れたときの危険信号（ストレスサイン） */}
          <section className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>ストレス・エネルギー低下時のサイン</span>
            </h4>
            <div className="space-y-1.5">
              {typeInfo.stressSignals.map((sig, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-200"
                >
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ストレスパターンと認知の歪みへの処方箋 */}
          {typeInfo.stressPatterns && typeInfo.stressPatterns.length > 0 && (
            <section className="space-y-2.5">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>思考の癖（認知の歪み）と対処ヒント</span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {typeInfo.stressPatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0C101C]/70 border border-slate-800 space-y-1"
                  >
                    <p className="text-xs font-bold text-rose-300">
                      Q: {pat.title}
                    </p>
                    <p className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold shrink-0">A:</span>
                      <span>{pat.advice}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ミネルヴァからのセルフケア・成長アドバイス */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦉</span>
              <span className="text-xs font-bold text-indigo-300">
                案内役ミネルヴァからのセルフケア助言
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed pl-1">
              {typeInfo.growthAdvice}
            </p>
          </div>
        </div>

        {/* モーダルフッター（アクションボタン） */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#0C101C]/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            あなたは本当に{typeCode}？100問の対話で精密診断してみよう。
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onPreviewResult && (
              <button
                onClick={() => {
                  onClose();
                  onPreviewResult(typeCode);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                レポート見本
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onStartDiagnosis();
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>今すぐ診断を始める</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
