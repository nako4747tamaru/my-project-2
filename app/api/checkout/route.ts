import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe Checkout セッション作成 API
 * POST /api/checkout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userName = 'ゲスト', type = 'INTP', returnPath = '/result' } = body;

    // リクエストヘッダーからオリジンを取得（Vercelまたはローカル環境を自動判別）
    const origin =
      req.headers.get('origin') ||
      req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID;

    // Stripe Secret Key が設定されている場合: 本番 Stripe Checkout セッションを作成
    if (stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey);

      // line_items の決定（STRIPE_PRICE_ID がある場合は Price ID を優先利用）
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = stripePriceId
        ? [
            {
              price: stripePriceId,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: 'jpy',
                product_data: {
                  name: 'ココロナビ 完全レポート解放（初月お試し）',
                  description: `${type}タイプ・${userName}様専用の認知の歪み詳細分析＆CBTメンタル処方箋（一生使える心の取扱説明書）`,
                  images: [`${origin}/images/animals/${type.toLowerCase()}.png`],
                },
                unit_amount: 980,
              },
              quantity: 1,
            },
          ];

      // セッションモード（STRIPE_MODE環境変数、またはPRICE_ID設定時はsubscriptionをデフォルトに）
      const mode: Stripe.Checkout.SessionCreateParams.Mode =
        (process.env.STRIPE_MODE as Stripe.Checkout.SessionCreateParams.Mode) ||
        (stripePriceId ? 'subscription' : 'payment');

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode,
        allow_promotion_codes: true,
        locale: 'ja',
        success_url: `${origin}${returnPath}?unlocked=true&success=true&session_id={CHECKOUT_SESSION_ID}&type=${type}&name=${encodeURIComponent(userName)}`,
        cancel_url: `${origin}${returnPath}?canceled=true&type=${type}&name=${encodeURIComponent(userName)}`,
        metadata: {
          userName,
          type,
        },
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Stripe Secret Key が未設定の場合（開発環境・テスト用フォールバック）:
    // 安全にアンロックフローを検証できるよう、成功リダイレクトURLを返却
    console.warn(
      '⚠️ STRIPE_SECRET_KEY is not configured. Running in development/demo mode.'
    );
    return NextResponse.json({
      url: `${origin}${returnPath}?unlocked=true&success=true&demo=true&type=${type}&name=${encodeURIComponent(userName)}`,
      isMock: true,
      message: 'Stripe未設定のため開発用シミュレーションURLを発行しました',
    });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || '決済セッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}
