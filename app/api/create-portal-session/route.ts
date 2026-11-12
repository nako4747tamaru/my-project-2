import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe Customer Portal（カスタマーポータル）セッション作成 API
 * POST /api/create-portal-session
 * 
 * リクエストボディ:
 * - customerId: Stripe の顧客ID (例: cus_...)
 * - sessionId: 直前の Checkout セッションID (顧客IDが手元にない場合のフォールバック用)
 * - customerEmail: 顧客のメールアドレス（顧客検索用フォールバック）
 * - returnPath: ポータル終了後に戻るパス（デフォルト: /account または /result）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { customerId, sessionId, customerEmail, returnPath = '/account' } = body;

    const origin =
      req.headers.get('origin') ||
      req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // 開発・モック用: Stripe未設定時はマイページへメッセージ付きで戻る
      return NextResponse.json({
        url: `${origin}${returnPath}?portal=demo`,
        isMock: true,
        message: 'STRIPE_SECRET_KEYが未設定のため、デモモードで動作しています。',
      });
    }

    const stripe = new Stripe(stripeSecretKey);

    // 1. customerId が未指定で sessionId がある場合、Checkout Session から取得
    if (!customerId && sessionId) {
      try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (typeof checkoutSession.customer === 'string') {
          customerId = checkoutSession.customer;
        } else if (checkoutSession.customer && typeof checkoutSession.customer === 'object') {
          customerId = checkoutSession.customer.id;
        }
      } catch (e) {
        console.warn('Checkout session retrieve failed for customer extraction:', e);
      }
    }

    // 2. それでも customerId がなく、customerEmail がある場合は Stripe の Customer を検索
    if (!customerId && customerEmail) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail.trim().toLowerCase(),
          limit: 1,
        });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      } catch (e) {
        console.warn('Customer list by email failed:', e);
      }
    }

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            '有効なご契約者情報（顧客IDまたは登録メールアドレス）が見つかりませんでした。診断時のCheckout完了画面からアクセスするか、ご登録のメールアドレスを入力してください。',
        },
        { status: 400 }
      );
    }

    // Stripe カスタマーポータルセッションを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}${returnPath}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Customer Portal Error:', error);
    return NextResponse.json(
      { error: error.message || 'カスタマーポータルの作成に失敗しました' },
      { status: 500 }
    );
  }
}
