import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPaymentThanksEmail } from '@/lib/mailer';
import { updateUserSubscription } from '@/lib/auth';

/**
 * Stripe Checkout セッション検証 API
 * GET /api/verify-session?session_id=cs_test_...
 * 
 * 決済完了画面から呼び出され、決済が有効であることを確認すると同時に
 * サンクスメール送信トリガーとしてもフォールバック動作します。
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY is not configured in environment variables.');
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEYが未設定のためセッションを検証できません。' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid = session.payment_status === 'paid' || session.status === 'complete';
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || null;
    const customerEmail = session.customer_details?.email || (typeof session.customer_email === 'string' ? session.customer_email : null);
    const customerName = session.customer_details?.name || session.metadata?.userName || 'お客様';
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id || null;

    // 決済完了時、Webhook未到達の場合のフォールバックとしてメール送信
    if (isPaid && customerEmail) {
      updateUserSubscription(customerEmail, {
        isPremium: true,
        stripeCustomerId: customerId || undefined,
        stripeSubscriptionId: subscriptionId || undefined,
      });

      const origin =
        req.headers.get('origin') ||
        req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      sendPaymentThanksEmail({
        toEmail: customerEmail,
        userName: customerName,
        amount: session.amount_total || 980,
        currency: session.currency || 'jpy',
        portalUrl: `${origin}/account`,
        reportUrl: `${origin}/result`,
      }).catch((e) => console.warn('Thanks email trigger error in verify-session:', e));
    }

    return NextResponse.json({
      paid: isPaid,
      customerId,
      customerEmail,
      subscriptionId,
      metadata: session.metadata,
    });
  } catch (error: any) {
    console.error('Session Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'セッションの検証に失敗しました' },
      { status: 500 }
    );
  }
}
