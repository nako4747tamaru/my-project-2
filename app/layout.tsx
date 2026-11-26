import type { Metadata } from 'next';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { ThemeProvider } from '../components/theme/ThemeContext';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kokoronavi.dev';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'ココロナビ 16タイプ診断｜100問の精密性格分析 × メンタル疲弊度チェック',
  description:
    '「ココロナビ 16タイプ診断」は、100の質問からあなたの本質と現在の心の疲弊度を精密分析する無料診断アプリです。知恵のフクロウ「ミネルヴァ」が16タイプの性格特性と思考のクセを優しくナビゲートします。',
  openGraph: {
    title: 'ココロナビ 16タイプ診断｜100問の精密性格分析 × メンタル疲弊度チェック',
    description:
      '「ココロナビ 16タイプ診断」は、100の質問からあなたの本質と現在の心の疲弊度を精密分析する無料診断アプリです。知恵のフクロウ「ミネルヴァ」が16タイプの性格特性と思考のクセを優しくナビゲートします。',
    url: appUrl,
    siteName: 'ココロナビ 16タイプ診断',
    images: [
      {
        url: '/api/og?type=INTP&name=ココロナビ 16タイプ診断',
        width: 1200,
        height: 630,
        alt: 'ココロナビ 16タイプ診断 プレビュー',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ココロナビ 16タイプ診断｜100問の精密性格分析 × メンタル疲弊度チェック',
    description:
      '「ココロナビ 16タイプ診断」は、100の質問からあなたの本質と現在の心の疲弊度を精密分析する無料診断アプリです。知恵のフクロウ「ミネルヴァ」が16タイプの性格特性と思考のクセを優しくナビゲートします。',
    images: ['/api/og?type=INTP&name=ココロナビ 16タイプ診断'],
  },
  verification: {
    google: 'rvZudja28WS1feh6gw0MDGQMgIZcODdB2-HQaVpGTYc',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2111086731004371';

  return (
    <html lang="ja" suppressHydrationWarning className="dark">
      <head>
        {/* テーマ初期化スクリプト（画面描画前のFOUC・チラつき防止） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('kokoro_navi_theme');
                  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                  var theme = saved ? saved : (prefersLight ? 'light' : 'dark');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google AdSense 審査・配信コード */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
          <ScrollToTopButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
