import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { registerUser, loginUser, updateUserSubscription } from '@/lib/auth';

/**
 * 認証 API (ログイン・新規登録)
 * POST /api/auth
 * 
 * 登録・ログイン時にStripe顧客情報（stripeCustomerId, isPremium）を自動照合・紐付けし、
 * 既存の決済データとシームレスに連携します。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, customerId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

    // メールアドレスまたは顧客IDからStripeサブスクリプションを検証するヘルパー
    const checkStripeSubscription = async (targetEmail: string, explicitCustId?: string) => {
      if (!stripe) return { isPremium: false, stripeCustomerId: explicitCustId };
      try {
        let custId = explicitCustId;
        if (!custId) {
          const customers = await stripe.customers.list({
            email: targetEmail.trim().toLowerCase(),
            limit: 1,
          });
          if (customers.data.length > 0) {
            custId = customers.data[0].id;
          }
        }
        if (!custId) return { isPremium: false, stripeCustomerId: undefined };

        const subs = await stripe.subscriptions.list({
          customer: custId,
          status: 'all',
          limit: 1,
        });

        const activeSub = subs.data.find(
          (s) => s.status === 'active' || s.status === 'trialing'
        );

        return {
          isPremium: !!activeSub,
          stripeCustomerId: custId,
          stripeSubscriptionId: activeSub?.id,
        };
      } catch (err) {
        console.warn('Stripe subscription link check error:', err);
        return { isPremium: false, stripeCustomerId: explicitCustId };
      }
    };

    if (action === 'register') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'パスワードは6文字以上で設定してください。' },
          { status: 400 }
        );
      }

      const result = registerUser(email, password, name || 'ゲスト');

      // 新規登録時にこれまでの決済情報（Stripe）をシームレスに紐付け
      const stripeData = await checkStripeSubscription(email, customerId);
      if (stripeData.stripeCustomerId || stripeData.isPremium) {
        updateUserSubscription(email, {
          isPremium: stripeData.isPremium,
          stripeCustomerId: stripeData.stripeCustomerId,
          stripeSubscriptionId: stripeData.stripeSubscriptionId,
        });
        result.user.isPremium = stripeData.isPremium;
        result.user.stripeCustomerId = stripeData.stripeCustomerId;
      }

      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: stripeData.isPremium
          ? 'アカウントを作成し、プレミアム会員権を連携しました！'
          : '新規登録が完了しました。',
      });

      // HTTP-only Cookie にセッショントークンを設定
      response.cookies.set('kokoro_session_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    } else if (action === 'login') {
      const result = loginUser(email, password);

      // ログイン時にも最新のStripe課金状態を照合して同期
      const stripeData = await checkStripeSubscription(email, customerId || result.user.stripeCustomerId);
      if (stripeData.stripeCustomerId || stripeData.isPremium !== undefined) {
        updateUserSubscription(email, {
          isPremium: stripeData.isPremium,
          stripeCustomerId: stripeData.stripeCustomerId,
          stripeSubscriptionId: stripeData.stripeSubscriptionId,
        });
        result.user.isPremium = stripeData.isPremium;
        result.user.stripeCustomerId = stripeData.stripeCustomerId;
      }

      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: 'ログインしました。',
      });

      response.cookies.set('kokoro_session_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } else {
      return NextResponse.json({ error: '不正なアクションです。' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '認証処理中にエラーが発生しました。' },
      { status: 400 }
    );
  }
}
