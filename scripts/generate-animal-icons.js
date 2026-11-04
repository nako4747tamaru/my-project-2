const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 10代〜30代前半に刺さる「ちいかわ・サンリオ風のゆるかわパステルポップ」
// グループ別パステル・ミルクカラー定義:
// - 分析家 (INTP/INTJ/ENTP/ENTJ): 淡いラベンダーパープル
// - 外交官 (INFP/INFJ/ENFP/ENFJ): ふんわりミントグリーン
// - 番人 (ISTP/ISTJ/ESTP/ESTJ): やさしいベビーブルー
// - 探検家 (ISFP/ISFJ/ESFP/ESFJ): あたたかみのあるクリームイエロー/シェルピンク

// フクロウ (INTP): もっちりふっくら丸い体型、不自然な足の線なし、愛嬌満点のサンリオ・ちいかわ風
function getOwlSvg() {
  return `
    <g transform="translate(128, 126)">
      <!-- 耳の羽角 (丸っこくて愛嬌のある小さなぴょこん耳) -->
      <path d="M-40 -40 C-50 -60 -25 -65 -18 -45 Z" fill="#6B5B95" />
      <path d="M40 -40 C50 -60 25 -65 18 -45 Z" fill="#6B5B95" />
      <path d="M-36 -42 C-43 -56 -26 -58 -22 -44 Z" fill="#C5B4E3" />
      <path d="M36 -42 C43 -56 26 -58 22 -44 Z" fill="#C5B4E3" />

      <!-- もっちりふっくら丸い体 (ラベンダーに調和する柔らかい紫グレー) -->
      <ellipse cx="0" cy="5" rx="56" ry="50" fill="#7C6A9C" />

      <!-- ちょこんと畳んだ丸い翼 (両サイド) -->
      <ellipse cx="-48" cy="8" rx="14" ry="28" fill="#685688" transform="rotate(10 -48 8)" />
      <ellipse cx="48" cy="8" rx="14" ry="28" fill="#685688" transform="rotate(-10 48 8)" />

      <!-- ふんわりマシュマロお腹 -->
      <ellipse cx="0" cy="16" rx="36" ry="34" fill="#F4EEFB" />

      <!-- お腹のゆるかわ羽模様 -->
      <path d="M-12 14 Q-7 19 -2 14" stroke="#B8A5D6" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M2 14 Q7 19 12 14" stroke="#B8A5D6" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M-5 25 Q0 30 5 25" stroke="#B8A5D6" stroke-width="2.5" stroke-linecap="round" fill="none" />

      <!-- まんまるくりくりの大きな目 (サンリオ・ちいかわ風) -->
      <ellipse cx="-20" cy="-6" rx="17" ry="17" fill="#FFFFFF" />
      <ellipse cx="20" cy="-6" rx="17" ry="17" fill="#FFFFFF" />

      <!-- 瞳 (ツヤツヤのうるうるアイ) -->
      <ellipse cx="-19" cy="-6" rx="12" ry="12" fill="#2E243D" />
      <ellipse cx="19" cy="-6" rx="12" ry="12" fill="#2E243D" />

      <!-- 大きなうるうるハイライト -->
      <circle cx="-23" cy="-10" r="4.5" fill="#FFFFFF" />
      <circle cx="15" cy="-10" r="4.5" fill="#FFFFFF" />
      <circle cx="-15" cy="-3" r="2.2" fill="#FFFFFF" />
      <circle cx="23" cy="-3" r="2.2" fill="#FFFFFF" />

      <!-- ぷっくり丸い小さなオレンジくちばし -->
      <path d="M-5 0 Q0 8 5 0 Q0 -3 -5 0 Z" fill="#FFA94D" />

      <!-- ほんのりピンクのぽわぽわほっぺチーク -->
      <ellipse cx="-33" cy="8" rx="9" ry="5.5" fill="#FF85A1" opacity="0.45" />
      <ellipse cx="33" cy="8" rx="9" ry="5.5" fill="#FF85A1" opacity="0.45" />

      <!-- 体にすっぽり収まるちんまりした丸い足先（不自然な足の線は完全に排除） -->
      <ellipse cx="-14" cy="52" rx="7" ry="4" fill="#FFA94D" />
      <ellipse cx="14" cy="52" rx="7" ry="4" fill="#FFA94D" />
    </g>
  `;
}

// タカ (ISTP): 足の線を完全排除、シンプル＆クリーンで丸っこくふっくらしたゆるかわタカ
function getHawkSvg() {
  return `
    <g transform="translate(128, 126)">
      <!-- 頭のぴょこんとした可愛い冠羽 (サンリオ・ちいかわ風) -->
      <path d="M-8 -46 Q-2 -62 10 -58 Q3 -48 -2 -42 Z" fill="#4B6584" />
      <path d="M-2 -44 Q8 -54 18 -48 Q10 -40 4 -38 Z" fill="#5E7898" />

      <!-- コロンと丸くふっくらした体 (ベビーブルーに映えるスモーキーブルーグレー) -->
      <ellipse cx="0" cy="5" rx="54" ry="48" fill="#4B6584" />

      <!-- ふっくらした丸い翼 (両脇) -->
      <ellipse cx="-46" cy="10" rx="13" ry="26" fill="#3D536E" transform="rotate(12 -46 10)" />
      <ellipse cx="46" cy="10" rx="13" ry="26" fill="#3D536E" transform="rotate(-12 46 10)" />

      <!-- マシュマロみたいなお腹エプロン (クリームホワイト) -->
      <ellipse cx="0" cy="15" rx="34" ry="32" fill="#F0F4F8" />

      <!-- 胸のちんまりした羽根マーク -->
      <path d="M-10 10 L0 18 L10 10" stroke="#8CA0B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M-8 22 L0 28 L8 22" stroke="#8CA0B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />

      <!-- まんまるくりくりの大きなタカの目 (きりっとしつつも愛嬌たっぷりのちいかわ風) -->
      <ellipse cx="-18" cy="-6" rx="15" ry="15" fill="#FFFFFF" />
      <ellipse cx="18" cy="-6" rx="15" ry="15" fill="#FFFFFF" />

      <!-- 瞳 (ゴールドアンバーのキラキラアイ) -->
      <ellipse cx="-17" cy="-6" rx="10.5" ry="10.5" fill="#D97706" />
      <ellipse cx="17" cy="-6" rx="10.5" ry="10.5" fill="#D97706" />

      <!-- 瞳孔 (黒目) -->
      <ellipse cx="-17" cy="-6" rx="7" ry="7" fill="#1E293B" />
      <ellipse cx="17" cy="-6" rx="7" ry="7" fill="#1E293B" />

      <!-- うるうるハイライト -->
      <circle cx="-20" cy="-9" r="3.8" fill="#FFFFFF" />
      <circle cx="14" cy="-9" r="3.8" fill="#FFFFFF" />
      <circle cx="-14" cy="-4" r="1.8" fill="#FFFFFF" />
      <circle cx="20" cy="-4" r="1.8" fill="#FFFFFF" />

      <!-- ちょこんと小さくカーブした可愛い黄色いくちばし -->
      <path d="M-6 -2 Q0 -5 6 -2 Q8 8 0 10 Q-8 8 -6 -2 Z" fill="#F59E0B" />
      <path d="M-1 3 Q0 10 2 3 Z" fill="#D97706" />

      <!-- ぽわっとした愛されほっぺチーク -->
      <ellipse cx="-32" cy="7" rx="8" ry="5" fill="#FF85A1" opacity="0.45" />
      <ellipse cx="32" cy="7" rx="8" ry="5" fill="#FF85A1" opacity="0.45" />

      <!-- 足の細い線は完全に排除！丸っこい体にすっぽり収まる可愛い爪先の丸みのみ -->
      <ellipse cx="-13" cy="50" rx="6.5" ry="3.5" fill="#F59E0B" />
      <ellipse cx="13" cy="50" rx="6.5" ry="3.5" fill="#F59E0B" />
    </g>
  `;
}

const animals = [
  // 分析家 (淡いラベンダーパープル)
  { type: 'INTP', label: 'フクロウ', customSvg: getOwlSvg(), bg1: '#F5EEFF', bg2: '#E5D4F8', border: '#D3BAF0', badgeBg: '#FFFFFF', badgeText: '#7C5295' },
  { type: 'INTJ', label: 'ワシ', emoji: '🦅', bg1: '#F3ECFE', bg2: '#E2D0FA', border: '#D0B6F0', badgeBg: '#FFFFFF', badgeText: '#764B93' },
  { type: 'ENTP', label: 'キツネ', emoji: '🦊', bg1: '#F7EFFE', bg2: '#E8D7FB', border: '#D7BEF4', badgeBg: '#FFFFFF', badgeText: '#7F569B' },
  { type: 'ENTJ', label: 'ライオン', emoji: '🦁', bg1: '#F1E8FD', bg2: '#DDC9F7', border: '#CDB0ED', badgeBg: '#FFFFFF', badgeText: '#6F438D' },

  // 外交官 (ふんわりミントグリーン)
  { type: 'INFP', label: 'ウサギ', emoji: '🐰', bg1: '#F0FDF4', bg2: '#DCFCE7', border: '#BBF7D0', badgeBg: '#FFFFFF', badgeText: '#15803D' },
  { type: 'INFJ', label: 'シカ', emoji: '🦌', bg1: '#F2FDF8', bg2: '#D5FBE9', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#047857' },
  { type: 'ENFP', label: 'イルカ', emoji: '🐬', bg1: '#F0FDFA', bg2: '#CCFBF1', border: '#99F6E4', badgeBg: '#FFFFFF', badgeText: '#0F766E' },
  { type: 'ENFJ', label: 'ペンギン', emoji: '🐧', bg1: '#ECFDF5', bg2: '#D1FAE5', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#065F46' },

  // 番人 (やさしいベビーブルー)
  { type: 'ISTP', label: 'タカ', customSvg: getHawkSvg(), bg1: '#F0F9FF', bg2: '#E0F2FE', border: '#BAE6FD', badgeBg: '#FFFFFF', badgeText: '#0369A1' },
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
    const centerGraphic = item.customSvg ? item.customSvg : `
      <!-- ほんのりピンクのほっぺチーク -->
      <ellipse cx="68" cy="168" rx="14" ry="8" fill="#FFB7B2" opacity="0.35" />
      <ellipse cx="188" cy="168" rx="14" ry="8" fill="#FFB7B2" opacity="0.35" />

      <!-- 中央の動物絵文字（上下余白が均等になるよう配置） -->
      <text x="128" y="168" font-size="98" text-anchor="middle" dominant-baseline="central">
        ${item.emoji}
      </text>
    `;

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

        ${centerGraphic}
        
        <!-- ゆるかわ下部ラベルバッジ（マシュマロ・もっちりピルバッジ） -->
        <g transform="translate(128, 210)" filter="url(#soft-shadow)">
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
  .then(() => console.log('Successfully regenerated animal icon images with custom owl & hawk!'))
  .catch((err) => {
    console.error('Error generating pastel-pop animal icons:', err);
    process.exit(1);
  });
