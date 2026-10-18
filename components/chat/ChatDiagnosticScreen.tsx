'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Menu,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { QUESTIONS, Question } from '../../lib/questions';
import { Answers } from '../../lib/personality';
import OwlMascot from '../common/OwlMascot';
import LegalModal, { LegalTab } from '../common/LegalModal';
import LegalFooter from '../common/LegalFooter';

interface ChatDiagnosticScreenProps {
  onComplete: (answers: Answers, nickname: string) => void;
  onPreviewSample?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  type?: 'text' | 'question';
  questionIndex?: number;
  isMilestone?: boolean;
}

const STORAGE_KEY_ANSWERS = 'kokoro_navi_answers_v2';
const STORAGE_KEY_NICKNAME = 'kokoro_navi_nickname_v2';
const STORAGE_KEY_INDEX = 'kokoro_navi_current_index_v2';

export default function ChatDiagnosticScreen({
  onComplete,
  onPreviewSample,
}: ChatDiagnosticScreenProps) {
  const [nickname, setNickname] = useState('');
  const [inputName, setInputName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 法務・規約モーダル用ステート
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // 初期メッセージ設定 ＆ localStorage復元
  useEffect(() => {
    let savedAnswers: Answers = {};
    let savedName = '';
    let savedIdx = 0;

    try {
      const a = localStorage.getItem(STORAGE_KEY_ANSWERS);
      if (a) savedAnswers = JSON.parse(a);
      const n = localStorage.getItem(STORAGE_KEY_NICKNAME);
      if (n) savedName = n;
      const i = localStorage.getItem(STORAGE_KEY_INDEX);
      if (i) savedIdx = parseInt(i, 10);
    } catch {
      // ignore
    }

    if (savedName) {
      setNickname(savedName);
      setIsStarted(true);
      setAnswers(savedAnswers);
      const safeIdx = Math.min(savedIdx || Object.keys(savedAnswers).length, QUESTIONS.length - 1);
      setCurrentIndex(safeIdx);

      setMessages([
        {
          id: 'welcome-1',
          sender: 'mascot',
          text: 'こんにちは！ ココロナビの案内役、フクロウの「ナビ」だよ🦉✨',
        },
        {
          id: 'welcome-2',
          sender: 'mascot',
          text: `お帰りなさい、${savedName}さん！待ってたよ🌿\n前回の続き（${safeIdx + 1}問目）から再開するね。焦らず肩の力を抜いて、あなたのペースでゆったり進めていこうね🍀`,
        },
        {
          id: 'welcome-user',
          sender: 'user',
          text: savedName,
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'mascot',
          text: 'こんにちは！ ココロナビへようこそ🦉✨ 案内役のフクロウ「ナビ」だよ。会えて嬉しいな！',
        },
        {
          id: 'welcome-2',
          sender: 'mascot',
          text: 'ここでは誰にも気兼ねせず、ありのままのあなたでいて大丈夫だよ。\n100問のやさしい対話を通して、あなたの16タイプ性格や心のエネルギー、無意識の「思考の癖」を一緒に紐解いていこうね🌿',
        },
        {
          id: 'welcome-3',
          sender: 'mascot',
          text: '途中でひと息ついたり画面を閉じても、自動でちゃんと保存されるから安心してね🍵\nまずは、なんて呼んだらいいかニックネームを教えてもらえるかな？✨',
        },
      ]);
    }
  }, []);

  // チャット自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentIndex, isStarted]);

  // ニックネーム送信
  const handleSendNickname = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputName.trim() || 'タカ';
    setNickname(trimmed);
    setIsStarted(true);
    try {
      localStorage.setItem(STORAGE_KEY_NICKNAME, trimmed);
    } catch {
      // ignore
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-name-${Date.now()}`,
        sender: 'user',
        text: trimmed,
      },
      {
        id: `mascot-greeting-${Date.now()}`,
        sender: 'mascot',
        text: `${trimmed}さん、教えてくれてありがとう！お話しできてすごく嬉しいな🦉🎈\n\n質問には正解も不正解もないよ。「こうあるべき」は手放して、直感で「今の自分に近いな」と感じるものをぽちっと選んでみてね。\n\nそれじゃあ、心の探検に出発しよう！🌿`,
      },
    ]);
  };

  // 質問への回答処理
  const handleSelectOption = (value: number, label: string) => {
    const nextIndex = currentIndex + 1;
    const nextAnswers = { ...answers, [nextIndex]: value, [currentIndex]: value };
    setAnswers(nextAnswers);

    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(nextAnswers));
      localStorage.setItem(STORAGE_KEY_INDEX, String(nextIndex));
    } catch {
      // ignore
    }

    // 回答バブルの作成
    const newMessages: ChatMessage[] = [
      {
        id: `q-ans-${currentIndex}-${Date.now()}`,
        sender: 'user',
        text: label,
      },
    ];

    // 25問・50問・75問・100問ごとのナビの労い・励ましメッセージバブル
    const targetName = nickname || 'あなた';
    if (nextIndex === 25) {
      newMessages.push({
        id: `milestone-25-${Date.now()}`,
        sender: 'mascot',
        isMilestone: true,
        text: `🎉 25問クリア！ ${targetName}さん、とっても順調だよ！\n\nまずは全体の1/4達成だね。ここまで丁寧に自分と向き合ってくれた自分を、いっぱい褒めてあげよう👏✨\n肩の力を抜いて、温かい飲み物でも飲みながらあなたのペースでゆったり進めていこうね🍵`,
      });
    } else if (nextIndex === 50) {
      newMessages.push({
        id: `milestone-50-${Date.now()}`,
        sender: 'mascot',
        isMilestone: true,
        text: `🌟 50問突破！ わあ、ちょうど折り返しのハーフタイムだよ！すごい集中力だね🦉💫\n\n${targetName}さんの豊かな個性や心のエネルギーが、少しずつ見えてきたよ…！\n軽く深呼吸して、首や肩をぐるっと回してリフレッシュしてみてね。後半もナビがずっとそばで見守っているよ🌿`,
      });
    } else if (nextIndex === 75) {
      newMessages.push({
        id: `milestone-75-${Date.now()}`,
        sender: 'mascot',
        isMilestone: true,
        text: `🎈 75問クリア！ いよいよあと25問、ラストスパートだね！本当にえらいっ✨\n\n${targetName}さんの思考の癖や心のコンディションも、かなり深く分析できているよ。\nあなただけの特別な診断レポートまであと一息！最後まで楽しんでいこうね🦉🌈`,
      });
    } else if (nextIndex >= QUESTIONS.length) {
      newMessages.push({
        id: `milestone-100-${Date.now()}`,
        sender: 'mascot',
        isMilestone: true,
        text: `🎊 100問完走、本当にお疲れさまでした！！最後までナビとお話ししてくれてありがとう💐✨\n\n${targetName}さんが一生懸命自分と向き合ってくれたこと、ナビはすっごく誇らしいよ。\nいま心の状態と16タイプ、思考の癖を丁寧に紐解いているからね…！さあ、分析結果レポートをお届けするよ🕊️`,
      });
    }

    setMessages((prev) => [...prev, ...newMessages]);

    // 次の質問へ進むか、完了か
    if (nextIndex >= QUESTIONS.length) {
      setTimeout(() => {
        onComplete(nextAnswers, nickname);
      }, 900);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // 前の質問に戻る
  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // リセット
  const handleReset = () => {
    if (confirm('最初からやり直しますか？')) {
      try {
        localStorage.removeItem(STORAGE_KEY_ANSWERS);
        localStorage.removeItem(STORAGE_KEY_NICKNAME);
        localStorage.removeItem(STORAGE_KEY_INDEX);
      } catch {
        // ignore
      }
      setAnswers({});
      setCurrentIndex(0);
      setIsStarted(false);
      setNickname('');
      setInputName('');
      setMessages([
        {
          id: 'welcome-1',
          sender: 'mascot',
          text: 'こんにちは！ ココロナビの案内役、フクロウの「ナビ」だよ🦉✨',
        },
        {
          id: 'welcome-2',
          sender: 'mascot',
          text: '100問の質問を通して、あなたの16タイプ性格や心のコンディションを一緒に探検しよう！途中で閉じても続きから再開できるから安心してね🌿',
        },
        {
          id: 'welcome-3',
          sender: 'mascot',
          text: 'まずは、あなたのお名前（ニックネーム）を教えてね✨',
        },
      ]);
    }
  };

  const answeredCount = Object.keys(answers).filter((k) => !isNaN(Number(k)) && Number(k) <= QUESTIONS.length).length / 2 || Object.keys(answers).length;
  const progressPercent = Math.min(
    100,
    Math.round((currentIndex / QUESTIONS.length) * 100)
  );

  const currentQuestion: Question | undefined = QUESTIONS[currentIndex];

  // 選択肢オプション
  const OPTIONS = [
    { value: 5, label: 'とても当てはまる', badge: '5', color: 'hover:border-indigo-400' },
    { value: 4, label: 'やや当てはまる', badge: '4', color: 'hover:border-indigo-400' },
    { value: 3, label: 'どちらでもない', badge: '3', color: 'hover:border-indigo-400' },
    { value: 2, label: 'あまり当てはまらない', badge: '2', color: 'hover:border-indigo-400' },
    { value: 1, label: '全く当てはまらない', badge: '1', color: 'hover:border-indigo-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-purple-200">
      {/* --- ヘッダー (Screenshot 1 & 2参照) --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <OwlMascot size={34} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">
                  {isStarted ? '16タイプ診断ナビ' : 'ココロナビ'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400">
                {isStarted
                  ? `質問 ${currentIndex + 1} / ${QUESTIONS.length} 進行中`
                  : '16タイプ × メンタルケア'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenLegal('privacy')}
              title="プライバシーポリシー・利用規約"
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </button>
            {isStarted && (
              <button
                onClick={handleReset}
                title="やり直す"
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {onPreviewSample && (
              <button
                onClick={onPreviewSample}
                className="px-2.5 py-1 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold border border-purple-700/60 transition-colors cursor-pointer"
              >
                結果を見る
              </button>
            )}
          </div>
        </div>

        {/* プログレスバー */}
        <div className="max-w-md mx-auto mt-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-medium">
            <span>
              {isStarted
                ? `進捗: ${currentIndex} / ${QUESTIONS.length} 問回答`
                : 'READY ニックネーム入力'}
            </span>
            <div className="flex items-center gap-1.5">
              {isStarted && currentIndex >= 25 && currentIndex < 50 && (
                <span className="text-[10px] text-amber-300 font-semibold animate-pulse">🌱 順調！</span>
              )}
              {isStarted && currentIndex >= 50 && currentIndex < 75 && (
                <span className="text-[10px] text-emerald-300 font-semibold animate-pulse">🌟 半分突破！</span>
              )}
              {isStarted && currentIndex >= 75 && currentIndex < 100 && (
                <span className="text-[10px] text-purple-300 font-semibold animate-pulse">🎈 あと少し！</span>
              )}
              <span className="font-bold text-purple-300">
                {isStarted ? `${progressPercent}%` : '0%'}
              </span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${isStarted ? Math.max(2, progressPercent) : 0}%` }}
            />
          </div>
        </div>
      </header>

      {/* --- チャット履歴エリア --- */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((m) => {
          const isMascot = m.sender === 'mascot';
          const isMilestone = Boolean(m.isMilestone);
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                isMascot ? 'justify-start' : 'justify-end'
              }`}
            >
              {isMascot && (
                <div className="relative shrink-0">
                  <OwlMascot size={32} className="mt-1" />
                  {isMilestone && (
                    <span className="absolute -top-1 -right-1 text-xs animate-bounce">
                      ✨
                    </span>
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                  isMilestone
                    ? 'bg-gradient-to-br from-[#25284A] via-[#1D213B] to-[#15192C] text-slate-100 border-2 border-amber-400/50 rounded-tl-sm shadow-amber-950/40 relative overflow-hidden'
                    : isMascot
                    ? 'bg-[#181F33] text-slate-200 border border-slate-700/60 rounded-tl-sm'
                    : 'bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white rounded-tr-sm font-medium'
                }`}
              >
                {isMilestone && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 mb-1.5 border-b border-amber-400/20 pb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>ナビからの応援メッセージ</span>
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}

        {/* 現在の質問カード（診断進行中） */}
        {isStarted && currentQuestion && (
          <div className="flex items-start gap-2.5 pt-2 animate-fadeIn">
            <OwlMascot size={32} className="mt-1" />

            <div className="flex-1 space-y-3">
              {/* 質問本文カード */}
              <div className="rounded-2xl bg-[#1A2238] border border-slate-700/70 p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                  <span>Q{currentIndex + 1} / {QUESTIONS.length}</span>
                  <span className="text-slate-400 text-[10px]">直感で選んでね</span>
                </div>

                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

              {/* 5段階の回答ボタン */}
              <div className="space-y-2">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value, opt.label)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#151B2E] hover:bg-[#202945] active:scale-[0.99] border border-slate-700/60 text-xs sm:text-sm text-slate-200 font-medium transition-all text-left cursor-pointer group"
                  >
                    <span className="group-hover:text-white transition-colors">
                      {opt.label}
                    </span>
                    <span className="text-[10px] w-5 h-5 rounded-full bg-slate-800 group-hover:bg-purple-900 group-hover:text-purple-200 text-slate-400 flex items-center justify-center font-bold">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* 前の質問に戻るボタン */}
              {currentIndex > 0 && (
                <div className="flex justify-start pt-1">
                  <button
                    onClick={handlePreviousQuestion}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>前の質問に戻る</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* --- 下部入力エリア（初期ニックネーム入力時のみ表示） --- */}
      {!isStarted && (
        <footer className="sticky bottom-0 bg-[#0C101C]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-3">
          <form
            onSubmit={handleSendNickname}
            className="max-w-md mx-auto space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="ニックネームを入力 (例: タカ)"
                maxLength={20}
                className="flex-1 bg-[#151B2E] border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#5558E6] hover:to-[#6D28D9] flex items-center justify-center text-white transition-transform active:scale-95 shrink-0 shadow-md shadow-indigo-950 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              診断を開始することで、
              <button
                type="button"
                onClick={() => handleOpenLegal('terms')}
                className="text-slate-400 hover:text-indigo-300 underline underline-offset-2 mx-1 cursor-pointer"
              >
                利用規約
              </button>
              および
              <button
                type="button"
                onClick={() => handleOpenLegal('privacy')}
                className="text-slate-400 hover:text-indigo-300 underline underline-offset-2 mx-1 cursor-pointer"
              >
                プライバシーポリシー
              </button>
              に同意したものとみなされます。
            </p>
          </form>
        </footer>
      )}

      {/* 初期画面での法務・規約フッター */}
      {!isStarted && <LegalFooter onOpenLegal={handleOpenLegal} />}

      {/* 法務・規約モーダル */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
