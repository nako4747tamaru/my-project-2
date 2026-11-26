import React, { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import ResultClient from './ResultClient';
import { PERSONALITY_TYPES } from '../../lib/analytics';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const type = typeof searchParams.type === 'string' ? searchParams.type.toUpperCase() : 'INTP';
  const name = typeof searchParams.name === 'string' ? searchParams.name : 'あなた';

  const info = (PERSONALITY_TYPES as any)[type] || {
    name: '論理学者型',
    shortName: '論理学者',
    catchphrase: '知性を研ぎ澄ます思索の旅人',
  };

  const typeName = info.shortName || info.name || type;
  const title = `【診断結果】${name}さんの性格タイプ: ${type}（${typeName}）| ココロナビ 16タイプ診断`;
  const description = `「${info.catchphrase}」100問の対話で導き出した、${name}さんの心と性格の取扱説明書です。あなたは何タイプ？無料で今すぐ診断！`;
  const ogImageUrl = `/api/og?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name}さんの診断結果 - ${type}（${typeName}）`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C101C] text-white flex items-center justify-center text-sm font-semibold">
          診断結果を読み込み中...
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
