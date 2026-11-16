const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 10代〜30代前半に刺さる「ちいかわ・サンリオ風のゆるかわパステルポップ」
// グループ別パステル・ミルクカラー定義:
// - 分析家 (INTP/INTJ/ENTP/ENTJ): 淡いラベンダーパープル
// - 外交官 (INFP/INFJ/ENFP/ENFJ): ふんわりミントグリーン
// - 番人 (ISTP/ISTJ/ESTP/ESTJ): やさしいベビーブルー
// - 探検家 (ISFP/ISFJ/ESFP/ESFJ): あたたかみのあるクリームイエロー/シェルピンク
//
// 動物アイコン: 全16タイプすべて完全固有のシルエット・イラスト！
// 特にワシ(INTJ)とタカ(ISTP)の重複を解消し、
// ワシ＝大空を悠然と旋回する雄大で重厚な翼・扇状尾羽、
// タカ＝鋭く急降下・高速飛行するシャープな三日月刃翼・直線尾羽・冠羽の固有ベクターを採用。

function getEagleGraphic(color) {
  return `
    <g transform="translate(128, 122) scale(0.92)" fill="${color}">
      <!-- 頭部と鋭いくちばし -->
      <path d="M-4 -44 Q0 -54 14 -44 Q26 -40 32 -30 Q24 -26 16 -28 Q12 -20 8 -14 L-4 -14 Z" />
      <path d="M18 -34 Q36 -30 34 -16 Q26 -18 22 -24 Z" />
      <!-- たくましい胴体 -->
      <path d="M-18 -14 Q-24 18 -10 46 Q0 52 10 46 Q22 18 16 -14 Z" />
      <!-- 雄大に斜め上へ広げた左翼（大空を旋回する巨大な翼） -->
      <path d="M-14 -8 C-35 -30 -70 -45 -98 -32 C-100 -18 -80 6 -40 16 C-30 20 -18 14 -14 6 Z" />
      <path d="M-98 -32 C-92 -20 -76 -6 -56 8 L-74 -10 Z" />
      <path d="M-86 -36 C-78 -24 -64 -12 -46 2 L-64 -18 Z" />
      <!-- 雄大に斜め上へ広げた右翼 -->
      <path d="M14 -8 C35 -30 70 -45 98 -32 C100 -18 80 6 40 16 C30 20 18 14 14 6 Z" />
      <path d="M98 -32 C92 -20 76 -6 56 8 L74 -10 Z" />
      <path d="M86 -36 C78 -24 64 -12 46 2 L64 -18 Z" />
      <!-- 扇状に開いた堂々たる尾羽 -->
      <path d="M-12 42 L-22 66 L-8 62 L0 68 L8 62 L22 66 L12 42 Z" />
    </g>
  `;
}

function getHawkGraphic(color) {
  return `
    <g transform="translate(128, 122) scale(0.92)" fill="${color}">
      <!-- 精悍でシャープな頭部と頭頂部の小さな飾り羽（タカ特有） -->
      <path d="M-2 -44 Q4 -58 12 -50 Q8 -42 4 -38 L16 -34 Q28 -32 30 -22 Q20 -20 14 -24 L6 -16 L-6 -18 Z" />
      <path d="M18 -26 Q30 -22 26 -12 Q18 -14 16 -20 Z" />
      <!-- 引き締まったスマートな流線型胴体 -->
      <path d="M-12 -12 Q-16 16 -6 44 Q0 48 6 44 Q16 16 12 -12 Z" />
      <!-- 高速飛行のために後ろに鋭角に反った左翼（シャープな三日月刃状） -->
      <path d="M-10 -6 C-32 -16 -68 -18 -100 10 C-82 16 -56 22 -24 14 L-10 4 Z" />
      <path d="M-100 10 C-82 24 -52 26 -28 20 L-68 14 Z" />
      <!-- 後ろに鋭角に反った右翼 -->
      <path d="M10 -6 C32 -16 68 -18 100 10 C82 16 56 22 24 14 L10 4 Z" />
      <path d="M100 10 C82 24 52 26 28 20 L68 14 Z" />
      <!-- タカ特有の長く狭いストレートな帯状尾羽 -->
      <path d="M-7 42 L-9 72 L0 75 L9 72 L7 42 Z" />
      <path d="M-5 50 L-7 70 L0 72 L7 70 L5 50 Z" />
    </g>
  `;
}

const animals = [
  // 分析家 (淡いラベンダーパープル)
  { type: 'INTP', label: 'フクロウ', emoji: '🦉', bg1: '#F5EEFF', bg2: '#E5D4F8', border: '#D3BAF0', badgeBg: '#FFFFFF', badgeText: '#7C5295' },
  { type: 'INTJ', label: 'ワシ',     custom: 'eagle', bg1: '#F3ECFE', bg2: '#E2D0FA', border: '#D0B6F0', badgeBg: '#FFFFFF', badgeText: '#764B93' },
  { type: 'ENTP', label: 'キツネ',   emoji: '🦊', bg1: '#F7EFFE', bg2: '#E8D7FB', border: '#D7BEF4', badgeBg: '#FFFFFF', badgeText: '#7F569B' },
  { type: 'ENTJ', label: 'ライオン', emoji: '🦁', bg1: '#F1E8FD', bg2: '#DDC9F7', border: '#CDB0ED', badgeBg: '#FFFFFF', badgeText: '#6F438D' },

  // 外交官 (ふんわりミントグリーン)
  { type: 'INFP', label: 'ウサギ',   emoji: '🐰', bg1: '#F0FDF4', bg2: '#DCFCE7', border: '#BBF7D0', badgeBg: '#FFFFFF', badgeText: '#15803D' },
  { type: 'INFJ', label: 'シカ',     emoji: '🦌', bg1: '#F2FDF8', bg2: '#D5FBE9', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#047857' },
  { type: 'ENFP', label: 'イルカ',   emoji: '🐬', bg1: '#F0FDFA', bg2: '#CCFBF1', border: '#99F6E4', badgeBg: '#FFFFFF', badgeText: '#0F766E' },
  { type: 'ENFJ', label: 'ペンギン', emoji: '🐧', bg1: '#ECFDF5', bg2: '#D1FAE5', border: '#A7F3D0', badgeBg: '#FFFFFF', badgeText: '#065F46' },

  // 番人 (やさしいベビーブルー)
  { type: 'ISTP', label: 'タカ',     custom: 'hawk',  bg1: '#F0F9FF', bg2: '#E0F2FE', border: '#BAE6FD', badgeBg: '#FFFFFF', badgeText: '#0369A1' },
  { type: 'ISTJ', label: 'カメ',     emoji: '🐢', bg1: '#EFF6FF', bg2: '#DBEAFE', border: '#BFDBFE', badgeBg: '#FFFFFF', badgeText: '#1D4ED8' },
  { type: 'ESTP', label: 'トラ',     emoji: '🐯', bg1: '#F0F9FF', bg2: '#E0F2FE', border: '#BAE6FD', badgeBg: '#FFFFFF', badgeText: '#0284C7' },
  { type: 'ESTJ', label: 'ウシ',     emoji: '🐮', bg1: '#F1F5F9', bg2: '#E2E8F0', border: '#CBD5E1', badgeBg: '#FFFFFF', badgeText: '#334155' },

  // 探検家 (あたたかみのあるクリームイエロー / シェルピンク)
  { type: 'ISFP', label: 'ネコ',     emoji: '🐱', bg1: '#FFFBEB', bg2: '#FEF3C7', border: '#FDE68A', badgeBg: '#FFFFFF', badgeText: '#B45309' },
  { type: 'ISFJ', label: 'クマ',     emoji: '🐻', bg1: '#FFF7ED', bg2: '#FFEDD5', border: '#FED7AA', badgeBg: '#FFFFFF', badgeText: '#C2410C' },
  { type: 'ESFP', label: 'オウム',   emoji: '🦜', bg1: '#FFF1F2', bg2: '#FFE4E6', border: '#FECDD3', badgeBg: '#FFFFFF', badgeText: '#BE123C' },
  { type: 'ESFJ', label: 'イヌ',     emoji: '🐶', bg1: '#FFF5F5', bg2: '#FED7D7', border: '#FEB2B2', badgeBg: '#FFFFFF', badgeText: '#9B2C2C' }
];

async function generate() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'animals');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const silhouetteColor = '#1F1C29';

  for (const item of animals) {
    let centerGraphic = '';
    if (item.custom === 'eagle') {
      centerGraphic = getEagleGraphic(silhouetteColor);
    } else if (item.custom === 'hawk') {
      centerGraphic = getHawkGraphic(silhouetteColor);
    } else {
      centerGraphic = `
        <text x="128" y="168" font-size="98"
          text-anchor="middle" dominant-baseline="central"
          filter="url(#silhouette-${item.type})">
          ${item.emoji}
        </text>
      `;
    }

    const svg = `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- ゆるふわパステルグラデーション -->
          <linearGradient id="grad-${item.type}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="${item.bg1}" />
            <stop offset="100%" stop-color="${item.bg2}" />
          </linearGradient>

          <!-- ぷっくりやわらかいソフトシャドウ -->
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
          </filter>

          <!-- 黒シルエット（影絵）フィルター: 絵文字を単色の暗いシルエットに変換 -->
          <filter id="silhouette-${item.type}" color-interpolation-filters="sRGB"
                  x="-5%" y="-5%" width="110%" height="110%">
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.12
                      0 0 0 0 0.11
                      0 0 0 0 0.16
                      0 0 0 1 0" />
          </filter>
        </defs>

        <!-- 背景ベース丸 (パステルカラー & 丸み) -->
        <circle cx="128" cy="128" r="120"
          fill="url(#grad-${item.type})"
          stroke="${item.border}" stroke-width="4" />

        <!-- かわいいステッチ・点線リング (サンリオ・ちいかわテイスト) -->
        <circle cx="128" cy="128" r="108"
          fill="none"
          stroke="${item.border}" stroke-width="2.5" stroke-dasharray="8 6" opacity="0.8" />

        <!-- かわいいキラキラハイライト (左上・右上) -->
        <circle cx="70" cy="65" r="5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="82" cy="74" r="2.5" fill="#FFFFFF" opacity="0.8" />
        <path d="M190 60 Q190 70 200 70 Q190 70 190 80 Q190 70 180 70 Q190 70 190 60 Z" fill="#FFFFFF" opacity="0.8" />

        <!-- 中央の動物グラフィック（16タイプ完全固有） -->
        ${centerGraphic}

        <!-- ゆるかわ下部ラベルバッジ（マシュマロ・もっちりピルバッジ） -->
        <g transform="translate(128, 210)" filter="url(#soft-shadow)">
          <rect x="-45" y="-13" width="90" height="26" rx="13"
            fill="${item.badgeBg}" stroke="${item.border}" stroke-width="1.5" />
          <text x="0" y="5"
            font-family="'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', 'Meiryo', sans-serif"
            font-size="13" font-weight="900"
            fill="${item.badgeText}" text-anchor="middle" letter-spacing="1">
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
  .then(() => console.log('All 16 animal icons regenerated with 100% unique graphics!'))
  .catch((err) => {
    console.error('Error generating animal icons:', err);
    process.exit(1);
  });
