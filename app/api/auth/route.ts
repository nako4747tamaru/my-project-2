import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser } from '@/lib/auth';

/**
 * 認証 API (ログイン・新規登録)
 * POST /api/auth
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'パスワードは6文字以上で設定してください。' },
          { status: 400 }
        );
      }
      const result = registerUser(email, password, name || 'ゲスト');
      
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: '新規登録が完了しました。',
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
