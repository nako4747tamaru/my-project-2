import nodemailer from 'nodemailer';

export interface SendReceiptEmailParams {
  toEmail: string;
  userName?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  portalUrl?: string;
  reportUrl?: string;
}

/**
 * 決済完了サンクスメール送信用ユーティリティ
 * 
 * SMTPサーバー設定（SMTP_HOST, SMTP_USER, SMTP_PASS）がある場合は実際のメールを送信。
 * 未設定時はコンソールログおよびモックモードとして正常完了扱い（開発/検証対応）。
 */
export async function sendPaymentThanksEmail(params: SendReceiptEmailParams) {
  const {
    toEmail,
    userName = 'お客様',
    planName = 'ココロナビ 完全レポート解放（月額会員）',
    amount = 980,
    currency = 'JPY',
    portalUrl = 'https://kokoronavi.dev/account',
    reportUrl = 'https://kokoronavi.dev/result',
  } = params;

  const subject = `【ココロナビ】ご購入ありがとうございます。完全レポートが解放されました🦉✨`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", Meiryo, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; }
    .content { padding: 32px 24px; line-height: 1.7; font-size: 15px; }
    .box { background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border-left: 4px solid #6366f1; }
    .box-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .box-row:last-child { margin-bottom: 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e11d48, #9333ea); color: #ffffff !important; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; text-align: center; margin: 24px 0 16px; }
    .footer { background: #f8fafc; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px; margin-bottom: 12px;">🦉✨</div>
      <h1>ココロナビ プレミアム会員へようこそ！</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">100問のメンタル・性格診断 完全レポートが解放されました</p>
    </div>
    
    <div class="content">
      <p><strong>${userName} 様</strong></p>
      <p>このたびは「ココロナビ」の有料プラン（完全レポート解放）にご登録いただき、誠にありがとうございます。</p>
      <p>お客様の決済手続きが正常に完了し、あなた専用の「認知の歪み10パターン全解放・CBTメンタル処方箋」がいつでも閲覧可能になりました。</p>

      <div class="box">
        <div style="font-weight: bold; margin-bottom: 10px; color: #0f172a;">■ ご請求内容</div>
        <div style="margin-bottom: 6px;">・プラン: <strong>${planName}</strong></div>
        <div style="margin-bottom: 6px;">・金額: <strong>¥${amount.toLocaleString()} (${currency.toUpperCase()}) / 月</strong></div>
        <div>・ステータス: <strong>決済完了（有効）</strong></div>
      </div>

      <div style="text-align: center;">
        <a href="${reportUrl}" class="btn">今すぐ完全レポート・処方箋を見る</a>
      </div>

      <p style="font-size: 13px; color: #475569; margin-top: 24px;">
        ※ サブスクリプションのご確認や、次回更新日の確認、領収書のダウンロード、解約手続きはいつでも下記の「マイページ」または「Stripeカスタマーポータル」より簡単に行っていただけます。<br>
        マイページ: <a href="${portalUrl}" style="color: #6366f1;">${portalUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px;">ココロナビ運営事務局</p>
      <p style="margin: 0;">本メールはココロナビでの決済完了時に自動送信されています。</p>
    </div>
  </div>
</body>
</html>
  `;

  // 環境変数チェック
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'ココロナビ <no-reply@kokoronavi.dev>';

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      console.log('✅ Payment thanks email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send thanks email via SMTP:', error);
      return { success: false, error };
    }
  } else {
    // 開発・未設定時のシミュレーション
    console.log(`ℹ️ [Email Simulation] To: ${toEmail} | Subject: ${subject}`);
    console.log(`ℹ️ SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Simulated success.`);
    return { success: true, simulated: true };
  }
}

/**
 * セキュリティ通知メールパラメータ
 */
export interface SendSecurityAlertParams {
  toEmail: string;
  userName?: string;
  type: 'login' | 'password_changed' | 'profile_updated';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * ログイン・アカウント情報変更時のセキュリティ通知メール送信
 */
export async function sendSecurityAlertEmail(params: SendSecurityAlertParams) {
  const {
    toEmail,
    userName = 'お客様',
    type,
    ipAddress = '—',
    userAgent = '—',
  } = params;

  const now = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());

  let actionTitle = 'アカウントへのログイン';
  let actionDetail = 'お客様のココロナビ アカウントへの新しいログインが確認されました。';
  if (type === 'password_changed') {
    actionTitle = 'パスワードの変更完了';
    actionDetail = 'お客様のアカウントのパスワードが正常に変更されました。';
  } else if (type === 'profile_updated') {
    actionTitle = 'プロフィール情報の更新完了';
    actionDetail = 'お客様のアカウント情報（お名前等）が正常に更新されました。';
  }

  const subject = `【ココロナビ】セキュリティ通知：${actionTitle}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", Meiryo, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px 24px; text-align: center; color: white; }
    .header h1 { margin: 0 0 6px; font-size: 20px; font-weight: 800; }
    .content { padding: 32px 24px; line-height: 1.7; font-size: 14px; }
    .box { background: #f8fafc; border-radius: 12px; padding: 18px 20px; margin: 20px 0; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; }
    .box-row { margin-bottom: 8px; font-size: 13px; }
    .box-row:last-child { margin-bottom: 0; }
    .alert-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0; color: #9f1239; font-size: 13px; }
    .footer { background: #f8fafc; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 36px; margin-bottom: 8px;">🦉 🛡️</div>
      <h1>セキュリティ通知</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">ココロナビ アカウントの安全を守るための自動通知です</p>
    </div>
    
    <div class="content">
      <p><strong>${userName} 様</strong></p>
      <p>${actionDetail}</p>

      <div class="box">
        <div style="font-weight: bold; margin-bottom: 10px; color: #0f172a;">■ 操作の詳細</div>
        <div class="box-row">・操作内容: <strong>${actionTitle}</strong></div>
        <div class="box-row">・日時（日本標準時）: <strong>${now}</strong></div>
        <div class="box-row">・接続元IPアドレス: <code>${ipAddress}</code></div>
        <div class="box-row">・端末・ブラウザ情報: <span style="color: #64748b; font-size: 12px;">${userAgent}</span></div>
      </div>

      <p>ご自身で行った操作である場合は、特別な対応は不要です。</p>

      <div class="alert-box">
        <strong>⚠️ もしこの操作に心当たりがない場合:</strong><br>
        第三者が不正にお客様のアカウントへアクセスした可能性があります。速やかにマイページにログインし、パスワードの変更を行ってください。<br>
        マイページ: <a href="https://kokoro-navi-fawn.vercel.app/account" style="color: #be123c; font-weight: bold;">https://kokoro-navi-fawn.vercel.app/account</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px;">ココロナビ運営セキュリティ事務局</p>
      <p style="margin: 0;">※このメールはセキュリティの観点から、アカウント操作時に重要なお知らせとして自動送信されています。</p>
    </div>
  </div>
</body>
</html>
  `;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'ココロナビ セキュリティ <no-reply@kokoronavi.dev>';

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      console.log(`✅ Security alert email (${type}) sent successfully:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send security alert email (${type}):`, error);
      return { success: false, error };
    }
  } else {
    // 開発・未設定時のシミュレーションログ
    console.log(`ℹ️ [Security Email Simulated] To: ${toEmail} | Type: ${type} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }
}
