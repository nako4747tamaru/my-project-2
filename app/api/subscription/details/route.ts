import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifySessionToken, getUserByEmail, updateUserSubscription } from '@/lib/auth';

/**
 * ログインユーザーのStripeサブスクリプション詳細情報取得 API
 * GET /api/subscription/details
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kokoro_session_token')?.value;
    let targetEmail: string | null = null;
    let targetCustomerId: string | null = null;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        targetEmail = payload.email;
        const user = getUserByEmail(payload.email);
        if (user?.stripeCustomerId) {
          targetCustomerId = user.stripeCustomerId;
        }
      }
    }

    // クエリパラメータからのフォールバック（未ログインでも確認可能）
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');
    const queryCustomerId = searchParams.get('customerId');

    if (!targetEmail && queryEmail) targetEmail = queryEmail.trim().toLowerCase();
    if (!targetCustomerId && queryCustomerId) targetCustomerId = queryCustomerId.trim();

    if (!targetEmail && !targetCustomerId) {
      return NextResponse.json({
        isPremium: false,
        status: 'none',
        planName: '無料プラン',
      });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      // 開発・未設定環境用モック
      return NextResponse.json({
        isPremium: true,
        status: 'active',
        planName: 'ココロナビ 完全レポート解放（月額会員）',
        amount: 980,
        currency: 'jpy',
        currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        cancelAtPeriodEnd: false,
        customerId: targetCustomerId || 'cus_demo_mock',
        isMock: true,
      });
    }

    const stripe = new Stripe(stripeSecretKey);

    // 1. customerId が手元にない場合はメールアドレスで顧客検索
    if (!targetCustomerId && targetEmail) {
      const customers = await stripe.customers.list({
        email: targetEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        targetCustomerId = customers.data[0].id;
      }
    }

    if (!targetCustomerId) {
      return NextResponse.json({
        isPremium: false,
        status: 'none',
        planName: '無料プラン',
      });
    }

    // 2. Stripeから有効なサブスクリプションを一覧取得
    const subscriptions = await stripe.subscriptions.list({
      customer: targetCustomerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // 顧客レコードはあるがサブスクリプションなし
      return NextResponse.json({
        isPremium: false,
        status: 'canceled',
        planName: '無料プラン（解約済み・未登録）',
        customerId: targetCustomerId,
      });
    }

    const sub = subscriptions.data[0];
    const isActive = sub.status === 'active' || sub.status === 'trialing';

    // ユーザー情報に同期保存
    if (targetEmail) {
      updateUserSubscription(targetEmail, {
        isPremium: isActive,
        stripeCustomerId: targetCustomerId,
        stripeSubscriptionId: sub.id,
      });
    }

    return NextResponse.json({
      isPremium: isActive,
      status: sub.status,
      subscriptionId: sub.id,
      customerId: targetCustomerId,
      planName: sub.items.data[0]?.price?.nickname || 'ココロナビ 完全レポート解放（月額会員）',
      amount: sub.items.data[0]?.price?.unit_amount || 980,
      currency: sub.items.data[0]?.price?.currency || 'jpy',
      currentPeriodEnd: (sub as any).current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  } catch (error: any) {
    console.error('Subscription details fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'サブスクリプション情報の取得に失敗しました。' },
      { status: 500 }
    );
  }
}
