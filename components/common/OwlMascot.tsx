import React from 'react';

interface OwlMascotProps {
  className?: string;
  size?: number;
}

export default function OwlMascot({ className = '', size = 48 }: OwlMascotProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="ココロナビのマスコット フクロウのナビ"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* 背景サークル（白・淡色） */}
        <circle cx="50" cy="50" r="48" fill="#FFF8F0" />

        {/* 外側フクロウボディ（ディープパープル） */}
        {/* 左耳・右耳の羽角 */}
        <path
          d="M26 34 L18 16 C25 20 32 25 36 30 Z"
          fill="#4338CA"
        />
        <path
          d="M74 34 L82 16 C75 20 68 25 64 30 Z"
          fill="#4338CA"
        />

        {/* 本体（丸みのあるフクロウの体） */}
        <ellipse cx="50" cy="56" rx="36" ry="34" fill="#4F46E5" />

        {/* 翼（左右） */}
        <path
          d="M14 54 C14 68 22 78 28 80 C24 74 20 64 20 54 C20 48 22 42 24 38 C18 42 14 48 14 54 Z"
          fill="#3730A3"
        />
        <path
          d="M86 54 C86 68 78 78 72 80 C76 74 80 64 80 54 C80 48 78 42 76 38 C82 42 86 48 86 54 Z"
          fill="#3730A3"
        />

        {/* お腹の羽（淡いラベンダー/クリーム） */}
        <ellipse cx="50" cy="65" rx="22" ry="20" fill="#E0E7FF" />
        {/* お腹の羽模様（かわいい山型） */}
        <path
          d="M42 60 Q45 64 48 60 M52 60 Q55 64 58 60 M46 68 Q50 72 54 68"
          stroke="#818CF8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* メガネ / 目元のフレーム（濃いバイオレット） */}
        <circle cx="36" cy="42" r="15" fill="#312E81" />
        <circle cx="64" cy="42" r="15" fill="#312E81" />
        <rect x="46" y="40" width="8" height="4" rx="2" fill="#312E81" />

        {/* 白目 */}
        <circle cx="36" cy="42" r="12" fill="#FFFFFF" />
        <circle cx="64" cy="42" r="12" fill="#FFFFFF" />

        {/* 瞳（ゴールド / オレンジブラウン） */}
        <circle cx="37" cy="42" r="8" fill="#F59E0B" />
        <circle cx="63" cy="42" r="8" fill="#F59E0B" />

        {/* 黒目 */}
        <circle cx="37" cy="42" r="5" fill="#1E1B4B" />
        <circle cx="63" cy="42" r="5" fill="#1E1B4B" />

        {/* ハイライト（輝く瞳） */}
        <circle cx="35" cy="39" r="2.5" fill="#FFFFFF" />
        <circle cx="61" cy="39" r="2.5" fill="#FFFFFF" />
        <circle cx="39" cy="44" r="1.2" fill="#FFFFFF" />
        <circle cx="65" cy="44" r="1.2" fill="#FFFFFF" />

        {/* くちばし（オレンジの三角形） */}
        <polygon points="50,44 44,55 56,55" fill="#F97316" />
        <polygon points="50,44 47,55 50,56" fill="#EA580C" />

        {/* 足（小さくて可愛い爪） */}
        <ellipse cx="43" cy="88" rx="4" ry="2.5" fill="#F97316" />
        <ellipse cx="57" cy="88" rx="4" ry="2.5" fill="#F97316" />
      </svg>
    </div>
  );
}
