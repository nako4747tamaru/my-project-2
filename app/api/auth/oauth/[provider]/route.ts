import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * ソーシャルログイン（OAuth 2.0 / OIDC）開始エンドポイント
 * GET /api/auth/oauth/[provider]
 * 
 * 対応プロバイダー: google, twitter, apple
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const origin =
    req.headers.get('origin') ||
    req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  let authUrl = '';

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('❌ GOOGLE_CLIENT_ID is not configured in environment variables.');
      return NextResponse.redirect(`${origin}/account?tab=auth&error=google_not_configured`);
    }

    const scope = encodeURIComponent('openid email profile');
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=select_account`;
  } else if (provider === 'twitter') {
    const clientId = process.env.TWITTER_CLIENT_ID;
    if (!clientId) {
      console.error('❌ TWITTER_CLIENT_ID is not configured in environment variables.');
      return NextResponse.redirect(`${origin}/account?tab=auth&error=twitter_not_configured`);
    }

    const scope = encodeURIComponent('users.read tweet.read');
    authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  } else if (provider === 'apple') {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      console.error('❌ APPLE_CLIENT_ID is not configured in environment variables.');
      return NextResponse.redirect(`${origin}/account?tab=auth&error=apple_not_configured`);
    }

    authUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code%20id_token&scope=name%20email&response_mode=form_post&state=${state}`;
  } else {
    return NextResponse.json({ error: 'サポートされていないプロバイダーです。' }, { status: 400 });
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('kokoro_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60, // 10分
    path: '/',
  });

  return response;
}
