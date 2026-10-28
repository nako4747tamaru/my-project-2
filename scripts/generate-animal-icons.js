const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const animals = [
  { type: 'INTP', label: 'フクロウ', emoji: '🦉', color1: '#4338CA', color2: '#6D28D9' },
  { type: 'INTJ', label: 'ワシ', emoji: '🦅', color1: '#3730A3', color2: '#5B21B6' },
  { type: 'ENTP', label: 'キツネ', emoji: '🦊', color1: '#4F46E5', color2: '#7C3AED' },
  { type: 'ENTJ', label: 'ライオン', emoji: '🦁', color1: '#312E81', color2: '#4C1D95' },
  { type: 'INFP', label: 'ウサギ', emoji: '🐰', color1: '#047857', color2: '#059669' },
  { type: 'INFJ', label: 'シカ', emoji: '🦌', color1: '#065F46', color2: '#047857' },
  { type: 'ENFP', label: 'イルカ', emoji: '🐬', color1: '#0D9488', color2: '#14B8A6' },
  { type: 'ENFJ', label: 'ペンギン', emoji: '🐧', color1: '#0F766E', color2: '#0D9488' },
  { type: 'ISTP', label: 'タカ', emoji: '🦅', color1: '#B45309', color2: '#D97706' },
  { type: 'ISTJ', label: 'カメ', emoji: '🐢', color1: '#0369A1', color2: '#0284C7' },
  { type: 'ESTP', label: 'トラ', emoji: '🐯', color1: '#C2410C', color2: '#EA580C' },
  { type: 'ESTJ', label: 'ウシ', emoji: '🐮', color1: '#1E40AF', color2: '#2563EB' },
  { type: 'ISFP', label: 'ネコ', emoji: '🐱', color1: '#D97706', color2: '#F59E0B' },
  { type: 'ISFJ', label: 'クマ', emoji: '🐻', color1: '#0284C7', color2: '#38BDF8' },
  { type: 'ESFP', label: 'オウム', emoji: '🦜', color1: '#E11D48', color2: '#F43F5E' },
  { type: 'ESFJ', label: 'イヌ', emoji: '🐶', color1: '#2563EB', color2: '#60A5FA' }
];

async function generate() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'animals');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const item of animals) {
    const svg = `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${item.type}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${item.color1}" />
            <stop offset="100%" stop-color="${item.color2}" />
          </linearGradient>
        </defs>
        
        <!-- Outer Circle / Card Background -->
        <circle cx="128" cy="128" r="120" fill="url(#grad-${item.type})" stroke="rgba(255,255,255,0.3)" stroke-width="4" />
        
        <!-- Inner Decorative Ring -->
        <circle cx="128" cy="128" r="106" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="6 6" />
        
        <!-- Large Animal Emoji Icon (タイプ名は完全削除し、中央の絵文字を拡大) -->
        <text x="128" y="118" font-size="96" text-anchor="middle" dominant-baseline="central">
          ${item.emoji}
        </text>
        
        <!-- Animal Label Badge (下部の動物名ラベルを維持) -->
        <g transform="translate(128, 202)">
          <rect x="-48" y="-13" width="96" height="26" rx="13" fill="rgba(0,0,0,0.38)" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
          <text x="0" y="5" font-family="'Hiragino Sans', 'Meiryo', 'Yu Gothic', sans-serif" font-size="14" font-weight="bold" fill="#F1F5F9" text-anchor="middle">
            ${item.label}
          </text>
        </g>
      </svg>
    `;

    const outPath = path.join(dir, `${item.type.toLowerCase()}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`Generated: ${item.type} (${item.label}) -> ${item.type.toLowerCase()}.png`);
  }
}

generate()
  .then(() => console.log('Successfully regenerated all 16 animal icon images!'))
  .catch((err) => {
    console.error('Error generating animal icons:', err);
    process.exit(1);
  });
