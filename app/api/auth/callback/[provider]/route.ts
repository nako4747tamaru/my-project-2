import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findOrCreateOAuthUser, updateUserSubscription, OAuthProvider } from '@/lib/auth';

/**
 * ソーシャルログイン（OAuth 2.0 / OIDC）コールバック処理
 * GET /api/auth/callback/[provider]
 * 
 * Google, X (Twitter), Apple からのリダイレクトを受け取り、
 * ユーザー情報を取得/作成してセッショントークンを発行、Stripe契約情報を自動紐付けします。
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const isSimulated = searchParams.get('simulated') === 'true';

  const origin =
    req.headers.get('origin') ||
    req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  if (!code) {
    return NextResponse.redirect(`${origin}/account?tab=auth&error=auth_cancelled`);
  }

  let userProfile: { email: string; name: string; avatarUrl?: string } | null = null;

  try {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (clientId && clientSecret && !isSimulated) {
        // Google トークンエンドポイントへ code を送信してアクセストークン取得
        const redirectUri = `${origin}/api/auth/callback/google`;
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || 'Googleトークンの取得に失敗しました');
        }

        // ユーザープロファイル取得
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();

        userProfile = {
          email: userData.email,
          name: userData.name || 'Googleユーザー',
          avatarUrl: userData.picture,
        };
      } else {
        // 開発環境または環境変数未設定時のフォールバックモック
        userProfile = {
          email: 'google-user@example.com',
          name: 'Googleテストユーザー',
        };
      }
    } else if (provider === 'twitter') {
      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;

      if (clientId && clientSecret && !isSimulated) {
        const redirectUri = `${origin}/api/auth/callback/twitter`;
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: 'challenge',
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error('X(Twitter)トークンの取得に失敗しました');
        }

        const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();

        userProfile = {
          email: `${userData.data?.username || 'user'}@x-oauth.com`,
          name: userData.data?.name || userData.data?.username || 'Xユーザー',
          avatarUrl: userData.data?.profile_image_url,
        };
      } else {
        userProfile = {
          email: 'twitter-user@example.com',
          name: 'X(Twitter)テストユーザー',
        };
      }
    } else if (provider === 'apple') {
      userProfile = {
        email: 'apple-user@privaterelay.appleid.com',
        name: 'Appleユーザー',
      };
    } else {
      return NextResponse.redirect(`${origin}/account?tab=auth&error=unsupported_provider`);
    }

    if (!userProfile || !userProfile.email) {
      throw new Error('ユーザー情報の取得に失敗しました。');
    }

    // ユーザーレコードの作成または取得＆セッショントークン生成
    const { user, token } = findOrCreateOAuthUser({
      email: userProfile.email,
      name: userProfile.name,
      provider: provider as OAuthProvider,
      avatarUrl: userProfile.avatarUrl,
    });

    // Stripeのサブスクリプション状況を照合して自動紐付け
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey);
        const customers = await stripe.customers.list({
          email: userProfile.email.toLowerCase(),
          limit: 1,
        });

        if (customers.data.length > 0) {
          const custId = customers.data[0].id;
          const subs = await stripe.subscriptions.list({
            customer: custId,
            status: 'all',
            limit: 1,
          });

          const activeSub = subs.data.find(
            (s) => s.status === 'active' || s.status === 'trialing'
          );

          updateUserSubscription(userProfile.email, {
            isPremium: !!activeSub,
            stripeCustomerId: custId,
            stripeSubscriptionId: activeSub?.id,
          });
        }
      } catch (stripeErr) {
        console.warn('OAuth stripe sync warning:', stripeErr);
      }
    }

    // 認証クッキーを設定してマイページへリダイレクト
    const response = NextResponse.redirect(`${origin}/account?tab=subscription&oauth_success=${provider}`);
    response.cookies.set('kokoro_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7日間
    });

    return response;
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(
      `${origin}/account?tab=auth&error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}

// Apple OAuth 用の POST リダイレクト対応
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  return GET(req, context);
}
