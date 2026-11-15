import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  getUserByEmail,
  updateProfile,
  changePassword,
  deleteAccount,
  generateSessionToken,
} from '@/lib/auth';

/**
 * ユーザープロファイル・設定更新・退会 API
 * PUT /api/auth/settings (名前変更 / パスワード変更)
 * DELETE /api/auth/settings (アカウント削除・退会)
 */

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('kokoro_session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'セッションが無効です。' }, { status: 401 });
    }

    const body = await req.json();
    const { action, name, oldPassword, newPassword } = body;

    if (action === 'update_profile') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'お名前を入力してください。' }, { status: 400 });
      }
      const updatedUser = updateProfile(payload.email, name);
      const newToken = generateSessionToken(updatedUser);

      const res = NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'プロフィールを更新しました。',
      });

      res.cookies.set('kokoro_session_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    } else if (action === 'change_password') {
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { error: '現在のパスワードと新しいパスワードを入力してください。' },
          { status: 400 }
        );
      }
      changePassword(payload.email, oldPassword, newPassword);
      return NextResponse.json({
        success: true,
        message: 'パスワードを変更しました。',
      });
    }

    return NextResponse.json({ error: '無効な操作です。' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '設定の更新に失敗しました。' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('kokoro_session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'セッションが無効です。' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;
    if (!password) {
      return NextResponse.json(
        { error: '退会手続きを行うにはパスワードを入力してください。' },
        { status: 400 }
      );
    }

    deleteAccount(payload.email, password);

    const res = NextResponse.json({
      success: true,
      message: 'アカウントを削除（退会）しました。ご利用ありがとうございました。',
    });
    res.cookies.delete('kokoro_session_token');
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '退会処理に失敗しました。' },
      { status: 400 }
    );
  }
}
