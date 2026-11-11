'use client';

import React from 'react';

interface AdContainerProps {
  /** AdSenseスロットID（将来用） */
  slot?: string;
  /** 表示フォーマット */
  format?: 'horizontal' | 'rectangle' | 'auto';
  className?: string;
  /** ラベル文言 */
  label?: string;
}

/**
 * Google AdSense レスポンシブ広告表示用コンテナ
 * 審査用・将来の広告掲載用プレースホルダー
 */
export default function AdContainer({
  slot,
  format = 'auto',
  className = '',
  label = 'スポンサーリンク',
}: AdContainerProps) {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className={`w-full max-w-2xl mx-auto my-6 px-4 ${className}`}>
      <div className="flex flex-col items-center justify-center">
        {/* スポンサーリンク ラベル */}
        <span className="text-[10px] tracking-wider text-slate-400/80 font-medium mb-1.5 self-center">
          {label}
        </span>

        {/* 広告表示枠（淡いグレーパステルのレスポンシブコンテナ） */}
        <div className="w-full min-h-[100px] sm:min-h-[120px] rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/60 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all hover:bg-slate-800/50">
          {adClientId && slot ? (
            // 実広告配信時用タグ
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%' }}
              data-ad-client={adClientId}
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive="true"
            />
          ) : (
            // プレースホルダー／審査用ダミー表示
            <div className="flex flex-col items-center justify-center gap-1.5 py-2 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-xs text-slate-300 font-bold mb-0.5">
                AD
              </div>
              <p className="text-xs font-semibold text-slate-300">
                広告掲載スペース
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                快適な無料診断をご提供するため、スポンサーリンクを表示させていただく場合があります。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
