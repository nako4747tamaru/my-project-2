'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, AlertCircle, HelpCircle } from 'lucide-react';

export type LegalTab = 'privacy' | 'tokusho' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = 'privacy',
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // initialTabの変更に追従
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // モーダルオープン時のスクロール抑制
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0C101C]/85 backdrop-blur-md animate-fadeIn">
      {/* 背景オーバーレイ（クリックで閉じる） */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[88vh] bg-[#141A29] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* --- ヘッダー --- */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#161D30]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                規約・各種ポリシー
              </h2>
              <p className="text-[10px] text-slate-400">ココロナビ KokoroNavi 公式表記</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* --- タブ切り替えバー --- */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-[#0F1424] px-2 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#141A29] text-indigo-300 border-t-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">プライバシー</span>
          </button>

          <button
            onClick={() => setActiveTab('tokusho')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === 'tokusho'
                ? 'bg-[#141A29] text-indigo-300 border-t-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">特定商取引法</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#141A29] text-indigo-300 border-t-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">利用規約</span>
          </button>
        </div>

        {/* --- コンテンツエリア --- */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs sm:text-[13px] leading-relaxed space-y-6 text-slate-300">
          {/* ======================================================== */}
          {/* 1. プライバシーポリシー */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">プライバシーポリシー</h3>
                <p className="text-[11px] text-slate-400">制定日: 2026年1月1日 / 最終改定日: 2026年10月18日</p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  1. 基本方針
                </h4>
                <p>
                  ココロナビ運営事務局（以下「当サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に関する法令及びその他の規範を遵守し、利用者の個人情報の適切な取り扱いと保護に努めます。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  2. 取得する情報および収集方法
                </h4>
                <p>当サービスでは、円滑なサービス提供のため以下の情報を取得する場合があります。</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>ユーザーが入力したニックネームおよび100問の診断回答データ</li>
                  <li>ブラウザのLocalStorageに保存される診断の一時セッション情報</li>
                  <li>アクセスログ（IPアドレス、ブラウザ種別、OS、アクセス日時、滞在時間）</li>
                  <li>Cookie（クッキー）および類似のストレージ技術による識別情報</li>
                  <li>有料決済時に決済事業者（Stripe等）から受領する決済完了ステータス（※クレジットカード番号情報は当サービスサーバーでは一切保持いたしません）</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  3. 情報の利用目的
                </h4>
                <p>取得した情報は、以下の目的のために利用いたします。</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>MBTI性格診断結果、メンタル疲弊度、認知の歪みスコアの算出およびパーソナライズされたレポートの表示・提供</li>
                  <li>診断セッションの中断・再開機能の実現</li>
                  <li>有料プランの認証およびコンテンツのアンロック処理</li>
                  <li>サービスの品質向上、新機能開発、利用動向の統計的分析（個人が特定されない形式）</li>
                  <li>不正アクセスや利用規約違反行為の検知・防止</li>
                  <li>ユーザーからのお問い合わせへの対応</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  4. Cookieおよび外部送信について
                </h4>
                <p>
                  当サービスでは、利用状況の分析や診断ステート保持のためにCookieおよびブラウザストレージを使用しています。ユーザーはブラウザの設定によりCookieを無効化することができますが、その場合一部機能が正常に動作しない場合があります。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  5. 個人情報の第三者提供の禁止
                </h4>
                <p>
                  当サービスは、法令に基づく場合や人の生命・身体の保護のために緊急に必要な場合を除き、利用者の事前の同意なく個人情報を第三者に提供・開示することはありません。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  6. 安全管理措置
                </h4>
                <p>
                  当サービスは、通信経路のSSL暗号化通信をはじめ、取り扱う情報の漏洩・滅失・毀損の防止のため必要かつ適切なセキュリティ対策を講じています。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  7. お問い合わせ窓口
                </h4>
                <p>
                  本プライバシーポリシーに関するご質問やご相談は、下記のお問い合わせ先までご連絡ください。
                </p>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  <p>ココロナビ運営事務局 個人情報管理担当</p>
                  <p>メール: privacy@kokoronavi.com</p>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. 特定商取引法に基づく表記 */}
          {/* ======================================================== */}
          {activeTab === 'tokusho' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">特定商取引法に基づく表記</h3>
                <p className="text-[11px] text-slate-400">特定商取引に関する法律第11条に基づく表示</p>
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
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">連絡先（電話番号）</th>
                      <td className="p-3 text-slate-300">
                        消費者からのご請求があった場合、遅滞なく開示いたします。お問い合わせはメール窓口よりお願いいたします。
                      </td>
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
                        クレジットカード決済（Visa, Mastercard, American Express, JCB等 / Stripeセキュア決済）
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">役務の提供時期</th>
                      <td className="p-3 text-slate-300">
                        決済完了後、即時に有料コンテンツ（認知の歪み7パターン詳細分析、処方箋シート等）がアンロックされ閲覧可能となります。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">返品・キャンセル・返金</th>
                      <td className="p-3 text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">【原則返品・返金不可】</strong><br />
                        デジタルコンテンツという商品の特性上、決済完了後のキャンセル・返品・返金はお受けいたしかねます。内容を十分にご確認のうえご購入ください。
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-bold text-slate-200 bg-slate-800/40">定期課金の解約について</th>
                      <td className="p-3 text-slate-300">
                        定期課金サービスをご利用の場合、いつでもマイページまたはお問い合わせ窓口から次回更新日の前日までに解約手続きを行っていただけます。契約期間途中での日割り精算・返金はございません。
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
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">利用規約</h3>
                <p className="text-[11px] text-slate-400">制定日: 2026年1月1日 / 最終改定日: 2026年10月18日</p>
              </div>

              {/* 医療行為ではない旨の重要免責アラート */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-200/90 leading-relaxed">
                  <strong className="font-bold text-amber-300 block mb-0.5">【重要免責事項: 医療行為ではありません】</strong>
                  ココロナビは、心理学モデルや認知行動療法（CBT）の理論を応用した自己理解・日常のセルフケアをサポートするためのエンターテインメント・自己啓発サービスです。医師や専門家による医療診断・精神科診療・治療行為に代わるものではありません。心身に深刻な不調がある場合は、速やかに専門の医療機関へご相談ください。
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第1条（規約の適用）
                </h4>
                <p>
                  本利用規約（以下「本規約」）は、ココロナビ運営事務局（以下「当方」）が提供する性格・メンタル自己分析サービス「ココロナビ」（以下「本サービス」）の利用条件を定めるものです。利用者の皆様は、本サービスを利用することにより本規約に同意したものとみなされます。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第2条（サービス内容および利用資格）
                </h4>
                <p>
                  1. 本サービスは、100問の質問に対する回答に基づいて、16タイプ性格傾向、メンタル疲弊度、認知の歪みスコア等を視覚化し、自己分析を支援するWebアプリケーションです。<br />
                  2. 本サービスは、インターネットに接続できる端末からどなたでもご利用いただけます。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第3条（禁止事項）
                </h4>
                <p>ユーザーは、本サービスの利用にあたり以下の行為を行ってはなりません。</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>当方または第三者の知的財産権、名誉、プライバシーを侵害する行為</li>
                  <li>本サービスのシステム、API、サーバーに対する過度な負荷や不正アクセス、リバースエンジニアリング行為</li>
                  <li>本サービスの診断ロジック、質問文、有料レポート内容を無断で複製・転載・商業利用・再配布する行為</li>
                  <li>虚偽の情報を登録・入力する行為、第三者になりすます行為</li>
                  <li>法令または公序良俗に反する行為</li>
                  <li>その他、当方が不適切と合理的に判断する行為</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第4条（有料サービスおよび決済）
                </h4>
                <p>
                  1. ユーザーは、当方が定める料金を支払うことにより、完全レポート等の有料コンテンツを利用することができます。<br />
                  2. 有料コンテンツの料金、支払方法等は本サイト上の購入ページおよび特定商取引法に基づく表記に定めます。<br />
                  3. 決済完了後のキャンセル・返金は、法律上の定めがある場合を除き原則として応じられません。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第5条（免責事項）
                </h4>
                <p>
                  1. 当方は、本サービスが提供する診断結果の正確性、有用性、特定の目的への適合性についていかなる保証も行いません。<br />
                  2. 本サービスの診断結果やセルフケアアドバイスを参考にした行動およびその結果について、当方は一切の責任を負いかねます。<br />
                  3. 当方は、システムの保守・点検、天災地変等の不可抗力により、事前の予告なく本サービスの提供を一時中断または終了することがあります。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第6条（規約の変更）
                </h4>
                <p>
                  当方は、必要に応じて本規約を変更することができます。規約改定後に本サービスを利用した場合、利用者は変更後の規約に同意したものとみなされます。
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  第7条（準拠法および管轄裁判所）
                </h4>
                <p>
                  本規約の解釈にあたっては日本法を準拠法とし、本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
              </section>
            </div>
          )}
        </div>

        {/* --- フッター --- */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#161D30]/90 text-[11px] text-slate-400">
          <span>© 2026 ココロナビ KokoroNavi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
