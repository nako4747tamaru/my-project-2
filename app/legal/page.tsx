'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, FileText, Scale, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import OwlMascot from '../../components/common/OwlMascot';
import { LegalTab } from '../../components/common/LegalModal';

function LegalContent() {
  const searchParams = useSearchParams();
  const initialTabParam = (searchParams.get('tab') as LegalTab) || 'privacy';

  const [activeTab, setActiveTab] = useState<LegalTab>(initialTabParam);

  useEffect(() => {
    const tab = searchParams.get('tab') as LegalTab;
    if (tab && (tab === 'privacy' || tab === 'tokusho' || tab === 'terms')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0C101C] text-slate-100 font-sans pb-16 selection:bg-purple-900 selection:text-purple-200">
      {/* --- ヘッダー --- */}
      <header className="sticky top-0 z-40 bg-[#0C101C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>診断トップへ戻る</span>
          </Link>

          <div className="flex items-center gap-2">
            <OwlMascot size={26} />
            <span className="text-sm font-bold text-white tracking-wide">ココロナビ 公式表記</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* --- タブバー --- */}
        <div className="grid grid-cols-3 border border-slate-700/80 rounded-2xl bg-[#141A29] p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">プライバシー</span>
          </button>

          <button
            onClick={() => setActiveTab('tokusho')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'tokusho'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">特定商取引法</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">利用規約</span>
          </button>
        </div>

        {/* --- 本文カード --- */}
        <div className="bg-[#141A29] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl text-xs sm:text-[13px] leading-relaxed space-y-6 text-slate-300">
          {/* ======================================================== */}
          {/* 1. プライバシーポリシー */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl font-black text-white mb-1">プライバシーポリシー</h1>
                <p className="text-xs text-slate-400">制定日: 2026年1月1日 / 最終改定日: 2026年10月18日</p>
              </div>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  1. 基本方針
                </h2>
                <p>
                  ココロナビ運営事務局（以下「当サービス」）は、利用者の個人情報の保護を最も重要な責務の一つと認識し、個人情報の保護に関する法律および関連法令を遵守し、利用者のプライバシー情報の適切な管理と保護に万全を尽くします。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  2. 取得する情報
                </h2>
                <p>当サービスでは、以下の情報を取得・保持する場合があります。</p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>診断時に入力されたニックネームおよび回答スコアデータ</li>
                  <li>診断セッションの保持に必要なLocalStorageデータ</li>
                  <li>アクセス日時、IPアドレス、ブラウザ情報、端末種別等のアクセスログ</li>
                  <li>Cookie（クッキー）情報</li>
                  <li>有料決済時にStripeから連携される決済識別子および購入履歴（カード情報は当方サーバーに保持しません）</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  3. 情報の利用目的
                </h2>
                <p>取得した情報は以下の目的にのみ利用します。</p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>MBTI性格タイプ、メンタル疲弊度、認知の歪み分析レポートの算出および表示</li>
                  <li>有料機能のアンロック認証および提供</li>
                  <li>サービスの運用、品質向上、統計分析（個人を特定できない統計値として集計）</li>
                  <li>不正アクセスの防止、利用規約違反の調査・対応</li>
                  <li>お問い合わせ対応</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  4. Cookieおよびローカルストレージの利用
                </h2>
                <p>
                  当サービスでは、快適な利用体験の提供および診断進捗の中断・再開のため、CookieおよびブラウザのLocalStorageを使用しています。ブラウザ設定によりこれらを無効化することが可能ですが、診断データの途中保存等の機能が制限される場合があります。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  5. 個人情報の第三者提供の制限
                </h2>
                <p>
                  当サービスは、法令に基づく場合を除き、利用者の事前の同意なく個人情報を第三者に提供・開示いたしません。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  6. お問い合わせ先
                </h2>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-200">ココロナビ運営事務局 個人情報担当</p>
                  <p>メールアドレス: privacy@kokoronavi.com</p>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. 特定商取引法に基づく表記 */}
          {/* ======================================================== */}
          {activeTab === 'tokusho' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl font-black text-white mb-1">特定商取引法に基づく表記</h1>
                <p className="text-xs text-slate-400">特定商取引に関する法律第11条に基づく表示</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <th className="w-1/3 p-3 font-bold text-slate-200 bg-slate-800/40">サービス名</th>
                      <td className="p-3 text-slate-300">ココロナビ（KokoroNavi）</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">販売事業者</th>
                      <td className="p-3 text-slate-300">ココロナビ運営事務局</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">運営責任者</th>
                      <td className="p-3 text-slate-300">ココロナビ運営責任者</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">所在地</th>
                      <td className="p-3 text-slate-300">
                        請求があった場合、遅滞なく電磁的記録または書面等により開示いたします。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">連絡先（メール）</th>
                      <td className="p-3 text-slate-300 font-mono">support@kokoronavi.com</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">販売価格</th>
                      <td className="p-3 text-slate-300">
                        プレミアム完全レポート解放: ¥980（税込・初月限定キャンペーン価格）<br />
                        ※詳細は各購入画面の表示価格をご確認ください。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">商品代金以外の必要料金</th>
                      <td className="p-3 text-slate-300">
                        インターネット接続料金、パケット通信料等は利用者のご負担となります。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">お支払方法</th>
                      <td className="p-3 text-slate-300">
                        クレジットカード決済（Stripeセキュア決済経由）
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">役務の提供時期</th>
                      <td className="p-3 text-slate-300">
                        決済完了後、即時に有料コンテンツがアンロックされ閲覧可能となります。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">返品・キャンセル・返金</th>
                      <td className="p-3 text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">【原則返品・返金不可】</strong><br />
                        デジタルコンテンツという商品の特性上、決済完了後のキャンセル・返品・返金はお受けいたしかねます。
                      </td>
                    </tr>
                    <tr>
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">推奨動作環境</th>
                      <td className="p-3 text-slate-300">
                        Google Chrome最新版, Apple Safari最新版, Microsoft Edge最新版, Mozilla Firefox最新版（iOS, Android, PC対応）
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. 利用規約 */}
          {/* ======================================================== */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl font-black text-white mb-1">利用規約</h1>
                <p className="text-xs text-slate-400">制定日: 2026年1月1日 / 最終改定日: 2026年10月18日</p>
              </div>

              {/* 医療行為ではない旨の重要免責アラート */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="font-bold text-amber-300 block mb-0.5">【重要免責事項: 医療行為ではありません】</strong>
                  ココロナビは、心理学モデルや認知行動療法（CBT）理論をベースにした自己理解・セルフケア支援サービスです。医師による医学的診断・診療・治療行為に代わるものではありません。深刻な心身の不調がある場合は速やかに専門の医療機関へご相談ください。
                </div>
              </div>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  第1条（規約の適用）
                </h2>
                <p>
                  本利用規約（以下「本規約」）は、ココロナビ運営事務局（以下「当方」）が提供する「ココロナビ」（以下「本サービス」）の利用条件を定めるものです。利用者の皆様は本規約に同意のうえ本サービスをご利用ください。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  第2条（サービス内容）
                </h2>
                <p>
                  本サービスは、100問の質問に対する回答に基づいて、16タイプ性格傾向、メンタル疲弊度、認知の歪みスコア等を視覚化し、自己分析を支援するWebアプリケーションです。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  第3条（禁止事項）
                </h2>
                <p>利用者は、以下の行為を行ってはなりません。</p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>当方または第三者の権利を侵害する行為</li>
                  <li>本サービスの不正利用、リバースエンジニアリング、過度な負荷をかける行為</li>
                  <li>本サービスのコンテンツ・診断ロジックの無断転載・商業的二次利用</li>
                  <li>法令または公序良俗に反する行為</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  第4条（有料サービス）
                </h2>
                <p>
                  有料プランの料金・支払方法は購入画面および特定商取引法に基づく表記に定めます。デジタルコンテンツの性質上、決済完了後のキャンセル・返金はお受けできません。
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  第5条（免責事項）
                </h2>
                <p>
                  当方は、本サービスの結果の完全性・特定の目的への適合性を保証するものではありません。本サービスを参考に行われた行動およびその結果について、当方は責任を負いかねます。
                </p>
              </section>
            </div>
          )}
        </div>

        {/* --- フッター --- */}
        <footer className="text-center text-xs text-slate-500 pt-4">
          <p>© 2026 ココロナビ（KokoroNavi） All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C101C] text-white p-6">読み込み中...</div>}>
      <LegalContent />
    </Suspense>
  );
}
