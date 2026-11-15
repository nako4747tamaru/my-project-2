import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { PERSONALITY_TYPES } from '@/lib/analytics';

export const runtime = 'edge';

/**
 * 動的OGP画像生成ルート
 * GET /api/og?type=INTP&name=たか
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'INTP').toUpperCase();
    const name = searchParams.get('name') || 'あなた';

    const info = (PERSONALITY_TYPES as any)[type] || {
      name: '論理学者型',
      shortName: '論理学者',
      group: '分析家',
      catchphrase: '知性を研ぎ澄ます思索の旅人',
      description: '客観的な事実と論理を重んじ、物事の本質を深く探求する性格です。',
    };

    const typeTitle = info.shortName || info.name || type;
    const groupName = info.group || '16タイプ性格診断';
    const catchphrase = info.catchphrase || '自分だけの取扱説明書と心の処方箋';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0C101C',
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
            padding: '48px 56px',
            fontFamily: 'sans-serif',
            color: '#F1F5F9',
          }}
        >
          {/* 上部ヘッダー */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '34px',
                  display: 'flex',
                }}
              >
                🦉✨
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                ココロナビ KokoroNavi
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(71, 85, 105, 0.6)',
                fontSize: '18px',
                color: '#cbd5e1',
              }}
            >
              100問のメンタル＆性格診断
            </div>
          </div>

          {/* 中央メインカード */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(24, 32, 51, 0.85)',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '28px',
              padding: '36px 40px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* 受検者バッジ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 20px',
                borderRadius: '9999px',
                backgroundColor: '#312e81',
                border: '1px solid #6366f1',
                fontSize: '20px',
                color: '#e0e7ff',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              {name} さんの診断結果
            </div>

            {/* タイプ大文字 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '20px',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '84px',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  color: '#FFFFFF',
                  textShadow: '0 4px 20px rgba(99, 102, 241, 0.6)',
                }}
              >
                {type}
              </span>
              <span
                style={{
                  fontSize: '38px',
                  fontWeight: 800,
                  color: '#a5b4fc',
                }}
              >
                （{typeTitle}）
              </span>
            </div>

            {/* キャッチフレーズ */}
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                color: '#fbcfe8',
                fontStyle: 'italic',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              「{catchphrase}」
            </div>
          </div>

          {/* 下部フッター */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '18px',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>#ココロナビ</span>
              <span>#性格診断</span>
              <span>#MBTI</span>
              <span>#{type}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#818cf8',
                fontWeight: 'bold',
              }}
            >
              <span>あなたは何タイプ？無料診断はこちら 👉 kokoronavi.com</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
