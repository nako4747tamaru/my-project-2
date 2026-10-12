import type { Metadata } from 'next';
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
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
