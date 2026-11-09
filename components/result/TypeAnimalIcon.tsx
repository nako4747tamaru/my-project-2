'use client';

import React from 'react';
import Image from 'next/image';
import OwlMascot from '../common/OwlMascot';

/**
 * 16タイプ → 動物アイコン画像パスのマッピング
 * 全16タイプすべて /images/animals/<type>.png に最新パステル・影絵シルエット画像を配置済み
 */
export const typeAnimalMap: Record<string, { src: string; label: string }> = {
  INTP: { src: '/images/animals/intp.png', label: 'フクロウ' },
  INTJ: { src: '/images/animals/intj.png', label: 'ワシ' },
  ENTP: { src: '/images/animals/entp.png', label: 'キツネ' },
  ENTJ: { src: '/images/animals/entj.png', label: 'ライオン' },
  INFP: { src: '/images/animals/infp.png', label: 'ウサギ' },
  INFJ: { src: '/images/animals/infj.png', label: 'シカ' },
  ENFP: { src: '/images/animals/enfp.png', label: 'イルカ' },
  ENFJ: { src: '/images/animals/enfj.png', label: 'ペンギン' },
  ISTP: { src: '/images/animals/istp.png', label: 'タカ' },
  ISTJ: { src: '/images/animals/istj.png', label: 'カメ' },
  ESTP: { src: '/images/animals/estp.png', label: 'トラ' },
  ESTJ: { src: '/images/animals/estj.png', label: 'ウシ' },
  ISFP: { src: '/images/animals/isfp.png', label: 'ネコ' },
  ISFJ: { src: '/images/animals/isfj.png', label: 'クマ' },
  ESFP: { src: '/images/animals/esfp.png', label: 'オウム' },
  ESFJ: { src: '/images/animals/esfj.png', label: 'イヌ' },
};

interface TypeAnimalIconProps {
  type: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * タイプ別動物アイコンコンポーネント。
 * Next.js 画像最適化のキャッシュ不整合を防ぐため unoptimized を明示し、
 * 鮮明かつ高速にローカルおよび本番（Vercel）で表示します。
 */
export default function TypeAnimalIcon({
  type,
  size = 96,
  className = '',
  priority = true,
}: TypeAnimalIconProps) {
  const normalizedType = (type || 'INTP').toUpperCase().trim();
  const animal = typeAnimalMap[normalizedType] || {
    src: `/images/animals/${normalizedType.toLowerCase()}.png`,
    label: 'マスコット',
  };
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return <OwlMascot size={size} className={className} />;
  }

  return (
    <Image
      src={animal.src}
      alt={`${normalizedType}タイプ・${animal.label}`}
      width={size}
      height={size}
      unoptimized
      priority={priority}
      className={`rounded-full object-contain drop-shadow-md select-none ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
