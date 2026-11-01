const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 10代〜30代前半に刺さる「ちいかわ・サンリオ風のゆるかわパステルポップ」
// グループ別パステル・ミルクカラー定義:
// - 分析家 (INTP/INTJ/ENTP/ENTJ): 淡いラベンダーパープル
// - 外交官 (INFP/INFJ/ENFP/ENFJ): ふんわりミントグリーン
// - 番人 (ISTP/ISTJ/ESTP/ESTJ): やさしいベビーブルー
// - 探検家 (ISFP/ISFJ/ESFP/ESFJ): あたたかみのあるクリームイエロー/シェルピンク

const animals = [
  // 分析家 (淡いラベンダーパープル)
  { type: 'INTP', label: 'フクロウ', emoji: '🦉', bg1: '#F5EEFF', bg2: '#E5D4F8', border: '#D3BAF0', badgeBg: '#FFFFFF', badgeText: '#7C5295' },
  { type: 'INTJ', label: 'ワシ', emoji: '🦅', bg1: '#F3ECFE', bg2: '#E2D0FA', border: '#D0B6F0', badgeBg: '#FFFFFF', badgeText: '#764B93' },
  { type: 'ENTP', label: 'キツネ', emoji: '🦊', bg1: '#F7EFFE', bg2: '#E8D7FB', border: '#D7BEF4', badgeBg: '#FFFFFF', badgeText: '#7F569B' },
  { type: 'ENTJ', label: 'ライオン', emoji: '🦁', bg1: '#F1E8FD', bg2: '#DDC9F7', border: '#CDB0ED', badgeBg: '#FFFFFF', badgeText: '#6F438D' },

  // 外交官 (ふんわりミントグリーン)
  { type: 'INFP', label: 'ウサギ', emoji: '🐰', bg1: '#F0FDF4', bg2: '#DCFCE7', border: '#BBF7D0', badgeBg: '#FFFFFF', badgeText: '#15803D' },
  { type: 'INFJ', label: 'シカ', emoji: '🦌', bg1: '#F2FDF8', bg2: '#D5FBE9', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#047857' },
  { type: 'ENFP', label: 'イルカ', emoji: '🐬', bg1: '#F0FDFA', bg2: '#CCFBF1', border: '#99F6E4', badgeBg: '#FFFFFF', badgeText: '#0F766E' },
  { type: 'ENFJ', label: 'ペンギン', emoji: '🐧', bg1: '#ECFDF5', bg2: '#D1FAE5', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#065F46' },

  // 番人 (やさしいベビーブルー)
  { type: 'ISTP', label: 'タカ', emoji: '🦅', bg1: '#F0F9FF', bg2: '#E0F2FE', border: '#BAE6FD', badgeBg: '#FFFFFF', badgeText: '#0369A1' },
  { type: 'ISTJ', label: 'カメ', emoji: '🐢', bg1: '#EFF6FF', bg2: '#DBEAFE', border: '#BFDBFE', badgeBg: '#FFFFFF', badgeText: '#1D4ED8' },
  { type: 'ESTP', label: 'トラ', emoji: '🐯', bg1: '#F0F9FF', bg2: '#E0F2FE', border: '#BAE6FD', badgeBg: '#FFFFFF', badgeText: '#0284C7' },
  { type: 'ESTJ', label: 'ウシ', emoji: '🐮', bg1: '#F1F5F9', bg2: '#E2E8F0', border: '#CBD5E1', badgeBg: '#FFFFFF', badgeText: '#334155' },

  // 探検家 (あたたかみのあるクリームイエロー / シェルピンク)
  { type: 'ISFP', label: 'ネコ', emoji: '🐱', bg1: '#FFFBEB', bg2: '#FEF3C7', border: '#FDE68A', badgeBg: '#FFFFFF', badgeText: '#B45309' },
  { type: 'ISFJ', label: 'クマ', emoji: '🐻', bg1: '#FFF7ED', bg2: '#FFEDD5', border: '#FED7AA', badgeBg: '#FFFFFF', badgeText: '#C2410C' },
  { type: 'ESFP', label: 'オウム', emoji: '🦜', bg1: '#FFF1F2', bg2: '#FFE4E6', border: '#FECDD3', badgeBg: '#FFFFFF', badgeText: '#BE123C' },
  { type: 'ESFJ', label: 'イヌ', emoji: '🐶', bg1: '#FFF5F5', bg2: '#FED7D7', border: '#FEB2B2', badgeBg: '#FFFFFF', badgeText: '#9B2C2C' }
];

async function generate() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'animals');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const item of animals) {
    const svg = `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- ゆるふわパステルグラデーション -->
          <linearGradient id="grad-${item.type}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${item.bg1}" />
            <stop offset="100%" stop-color="${item.bg2}" />
          </linearGradient>

          <!-- ぷっくりやわらかいソフトシャドウ -->
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
          </filter>
        </defs>
        
        <!-- 背景ベース丸 (パステルカラー & 丸み) -->
        <circle cx="128" cy="128" r="120" fill="url(#grad-${item.type})" stroke="${item.border}" stroke-width="4" />
        
        <!-- かわいいステッチ・点線リング (サンリオ・ちいかわテイスト) -->
        <circle cx="128" cy="128" r="108" fill="none" stroke="${item.border}" stroke-width="2.5" stroke-dasharray="8 6" opacity="0.8" />
        
        <!-- かわいいキラキラハイライト (左上・右上) -->
        <circle cx="70" cy="65" r="5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="82" cy="74" r="2.5" fill="#FFFFFF" opacity="0.8" />
        <path d="M190 60 Q190 70 200 70 Q190 70 190 80 Q190 70 180 70 Q190 70 190 60 Z" fill="#FFFFFF" opacity="0.8" />

        <!-- ほんのりピンクのほっぺチーク（愛嬌アップ） -->
        <ellipse cx="68" cy="148" rx="14" ry="8" fill="#FFB7B2" opacity="0.35" />
        <ellipse cx="188" cy="148" rx="14" ry="8" fill="#FFB7B2" opacity="0.35" />

        <!-- 中央の動物絵文字（上下余白均等の真中心に調整: y=138） -->
        <text x="128" y="138" font-size="104" text-anchor="middle" dominant-baseline="central">
          ${item.emoji}
        </text>
        
        <!-- ゆるかわ下部ラベルバッジ（マシュマロ・もっちりピルバッジ） -->
        <g transform="translate(128, 204)" filter="url(#soft-shadow)">
          <rect x="-45" y="-13" width="90" height="26" rx="13" fill="${item.badgeBg}" stroke="${item.border}" stroke-width="1.5" />
          <text x="0" y="5" font-family="'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', 'Meiryo', sans-serif" font-size="13" font-weight="900" fill="${item.badgeText}" text-anchor="middle" letter-spacing="1">
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
  .then(() => console.log('Successfully generated all 16 pastel-pop animal icon images!'))
  .catch((err) => {
    console.error('Error generating pastel-pop animal icons:', err);
    process.exit(1);
  });
