'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    q: '診断にはどれくらいの時間がかかりますか？',
    a: '100問の質問を用意しており、直感でお答えいただくと約8〜12分程度で完了します。途中でブラウザを閉じても回答状況は自動保存されるため、いつでも続きから再開できます。',
  },
  {
    q: 'なぜ16タイプだけでなく「疲弊度」や「認知の歪み」も同時に診断するのですか？',
    a: '性格タイプは持って生まれた傾向を示しますが、同じ性格でも「元気な時」と「心が疲れている時」では発揮できる力やストレスの現れ方が大きく異なります。本サービスでは、認知行動療法（CBT）のアプローチを取り入れ、今の心の疲労度と無意識の思考パターンを同時に可視化することで、実践的なセルフケアに役立てていただくことを目的としています。',
  },
  {
    q: '診断は完全無料で利用できますか？',
    a: 'はい、100問の診断実施、16タイプ性格プロファイリング、疲弊度レベル、認知の歪み分析、および基本的なセルフケア処方箋は登録不要・完全無料でご利用いただけます。より詳細な16タイプ別取扱説明書やPDF・画像保存などの追加機能も提供しています。',
  },
  {
    q: '回答データや個人情報は安全に保護されますか？',
    a: '診断時の回答データや入力されたニックネームは、主にご利用端末のブラウザ内（LocalStorage）に安全に保存されます。また、通信はすべてSSL/TLSによって暗号化されており、プライバシーポリシーに則り厳格に保護されています。',
  },
  {
    q: '精神科や心療内科の医療診断として使えますか？',
    a: '本サービスは心理学・自己分析に基づく自己理解支援ツールであり、医師による確定診断や精神医学的治療を行うものではありません。深刻な不安や抑うつ症状が続いている場合は、我慢なさらずに専門の医療機関や公的な相談窓口へご相談ください。',
  },
];

export default function FaqSection() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>よくあるご質問（FAQ）</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          診断に関する疑問と安心のサポート
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          初めての方にも安心して受診していただけるよう、診断の仕組みやプライバシー保護についてお答えします。
        </p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {FAQ_LIST.map((faq, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#141A29] border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-400 font-extrabold">Q.</span>
                  <span>{faq.q}</span>
                </span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-[13px] text-slate-300 leading-relaxed border-t border-slate-800/60 bg-[#0C101C]/50 flex items-start gap-2 animate-fadeIn">
                  <span className="text-emerald-400 font-bold shrink-0">A.</span>
                  <span>{faq.a}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
