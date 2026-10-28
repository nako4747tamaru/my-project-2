'use client';

import React from 'react';
import Image from 'next/image';
import OwlMascot from '../common/OwlMascot';

/**
 * 16タイプ → 動物アイコン画像パスのマッピング
 * 画像は /images/animals/<type>.png を想定（未配置の場合はフォールバック）
 */
export const typeAnimalMap: Record<string, { src: string; label: string }> = {
  INTP: { src: '/images/animals/intp.png',  label: 'フクロウ' },
  INTJ: { src: '/images/animals/intj.png',  label: 'ワシ' },
  ENTP: { src: '/images/animals/entp.png',  label: 'キツネ' },
  ENTJ: { src: '/images/animals/entj.png',  label: 'ライオン' },
  INFP: { src: '/images/animals/infp.png',  label: 'ウサギ' },
  INFJ: { src: '/images/animals/infj.png',  label: 'シカ' },
  ENFP: { src: '/images/animals/enfp.png',  label: 'イルカ' },
  ENFJ: { src: '/images/animals/enfj.png',  label: 'ペンギン' },
  ISTP: { src: '/images/animals/istp.png',  label: 'タカ' },
  ISTJ: { src: '/images/animals/istj.png',  label: 'カメ' },
  ESTP: { src: '/images/animals/estp.png',  label: 'トラ' },
  ESTJ: { src: '/images/animals/estj.png',  label: 'ウシ' },
  ISFP: { src: '/images/animals/isfp.png',  label: 'ネコ' },
  ISFJ: { src: '/images/animals/isfj.png',  label: 'クマ' },
  ESFP: { src: '/images/animals/esfp.png',  label: 'オウム' },
  ESFJ: { src: '/images/animals/esfj.png',  label: 'イヌ' },
};

interface TypeAnimalIconProps {
  type: string;
  size?: number;
  className?: string;
}

/**
 * タイプ別動物アイコンコンポーネント。
 * 対応画像ファイルが存在しない場合はデフォルトのフクロウマスコットを表示する。
 */
export default function TypeAnimalIcon({ type, size = 72, className = '' }: TypeAnimalIconProps) {
  const animal = typeAnimalMap[type];
  const [imgError, setImgError] = React.useState(false);

  if (!animal || imgError) {
    return <OwlMascot size={size} className={className} />;
  }

  return (
    <Image
      src={animal.src}
      alt={`${type}タイプ・${animal.label}`}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
