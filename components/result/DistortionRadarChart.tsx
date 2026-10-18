'use client';

import React from 'react';
import { DistortionScoreItem } from '../../lib/personality';

interface DistortionRadarChartProps {
  distortions: DistortionScoreItem[];
  size?: number;
  className?: string;
}

export default function DistortionRadarChart({
  distortions,
  size = 320,
  className = '',
}: DistortionRadarChartProps) {
  // 7角形の計算
  const count = distortions.length || 7;
  const center = size / 2;
  const radius = size * 0.32; // 外側半径（ラベル用スペースを確保）

  // 各軸の角度（12時方向から時計回り）
  const getCoordinates = (index: number, ratio: number, customRadius = radius) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const r = customRadius * ratio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // 背景のグリッド（同心7角形: 20%, 40%, 60%, 80%, 100%）
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const gridPolygons = gridLevels.map((level) => {
    const points = distortions
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    return { level, points };
  });

  // ユーザーのスコアポリゴン
  const scorePoints = distortions
    .map((item, i) => {
      // 0〜100%の値を 0.1〜1.0 の比率に正規化（見栄えのため最小比率を0.1に設定）
      const ratio = Math.max(0.12, Math.min(1.0, (item.percentage || 0) / 100));
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 最も高いスコアの項目を特定
  const maxScore = Math.max(...distortions.map((d) => d.percentage || 0));

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label="認知の歪み7パターン レーダーチャート"
      >
        {/* 定義: グラデーション */}
        <defs>
          <linearGradient id="distortionRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* グリッド同心7角形 */}
        {gridPolygons.map(({ level, points }) => (
          <polygon
            key={level}
            points={points}
            fill={level === 1.0 ? '#131B2E' : level === 0.6 ? '#161F36' : 'none'}
            fillOpacity={level === 1.0 ? '0.4' : '0.2'}
            stroke={level === 1.0 ? '#475569' : '#334155'}
            strokeWidth={level === 1.0 ? '1.5' : '1'}
            strokeDasharray={level === 1.0 ? undefined : '2,3'}
          />
        ))}

        {/* 中心から各頂点への軸線 */}
        {distortions.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}

        {/* ユーザースコアポリゴン (塗りつぶし＆ボーダー) */}
        <polygon
          points={scorePoints}
          fill="url(#distortionRadarGrad)"
          stroke="#C084FC"
          strokeWidth="2.5"
        />

        {/* 各頂点のデータポイント（丸） */}
        {distortions.map((item, i) => {
          const ratio = Math.max(0.12, Math.min(1.0, (item.percentage || 0) / 100));
          const { x, y } = getCoordinates(i, ratio);
          const isHighest = item.percentage === maxScore && maxScore > 0;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isHighest ? 5 : 3.5}
                fill={isHighest ? '#F43F5E' : '#A855F7'}
                stroke="#FFFFFF"
                strokeWidth={isHighest ? 2 : 1.5}
              />
            </g>
          );
        })}

        {/* 各軸のラベルテキスト */}
        {distortions.map((item, i) => {
          // ラベル用の少し外側の座標
          const labelRadius = radius * 1.32;
          const { x, y, angle } = getCoordinates(i, 1.0, labelRadius);
          const isHighest = item.percentage === maxScore && maxScore > 0;

          // 角度に応じたテキストアンカー
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          const cos = Math.cos(angle);
          if (cos > 0.3) {
            textAnchor = 'start';
          } else if (cos < -0.3) {
            textAnchor = 'end';
          }

          // 縦位置のオフセット
          const sin = Math.sin(angle);
          let dy1 = 0;
          let dy2 = 12;
          if (sin < -0.6) {
            // 真上付近
            dy1 = -10;
            dy2 = 3;
          } else if (sin > 0.6) {
            // 真下付近
            dy1 = 4;
            dy2 = 16;
          }

          return (
            <g key={item.type || i}>
              <text
                x={x}
                y={y + dy1}
                textAnchor={textAnchor}
                className={`text-[10px] font-bold ${
                  isHighest ? 'fill-rose-300 font-extrabold' : 'fill-slate-300'
                }`}
                style={{ fontSize: '10.5px' }}
              >
                {item.shortName || item.name}
              </text>
              <text
                x={x}
                y={y + dy2}
                textAnchor={textAnchor}
                className={`text-[10px] font-mono font-bold ${
                  isHighest ? 'fill-amber-300' : 'fill-indigo-300'
                }`}
                style={{ fontSize: '10px' }}
              >
                {item.percentage}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* 凡例 / ガイド */}
      <div className="flex items-center justify-center gap-4 mt-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
          <span>あなたの傾向スコア</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>最も顕著な思考癖</span>
        </div>
      </div>
    </div>
  );
}
