import type { Metadata } from 'next';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { ThemeProvider } from '../components/theme/ThemeContext';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kokoronavi.dev';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Kokoro Navi - 100問のメンタル・性格診断',
  description: '100の問いから紡ぎ出された、あなたの心の地図。MBTI性格診断・メンタル疲弊度・認知の歪み分析アプリ',
  openGraph: {
    title: 'Kokoro Navi - 100問のメンタル・性格診断',
    description: '100の問いから紡ぎ出された、あなたの心の地図。MBTI性格診断・メンタル疲弊度・認知の歪み分析アプリ',
    url: appUrl,
    siteName: 'ココロナビ KokoroNavi',
    images: [
      {
        url: '/api/og?type=INTP&name=ココロナビ',
        width: 1200,
        height: 630,
        alt: 'ココロナビ 診断結果プレビュー',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kokoro Navi - 100問のメンタル・性格診断',
    description: '100の問いから紡ぎ出された、あなたの心の地図。MBTI性格診断・メンタル疲弊度・認知の歪み分析アプリ',
    images: ['/api/og?type=INTP&name=ココロナビ'],
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
