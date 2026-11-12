import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe Checkout セッション検証 API
 * GET /api/verify-session?session_id=cs_test_...
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
      // 未設定時はデモモードとして有効扱い
      return NextResponse.json({ paid: true, demo: true });
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || null;

    return NextResponse.json({
      paid: session.payment_status === 'paid' || session.status === 'complete',
      customerId,
      customerEmail: session.customer_details?.email,
      subscriptionId:
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id || null,
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
