import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kokoro Navi - 100問のメンタル・性格診断',
  description: '100の問いから紡ぎ出された、あなたの心の地図。MBTI性格診断・メンタル疲弊度・認知の歪み分析アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ja">
      <head>
        {/* Google AdSense 審査・配信タグ（環境変数 NEXT_PUBLIC_ADSENSE_CLIENT_ID 設定時のみ出力） */}
        {adsenseClientId && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
