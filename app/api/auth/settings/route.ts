import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  getUserByEmail,
  updateProfile,
  changePassword,
  deleteAccount,
  generateSessionToken,
} from '@/lib/auth';
import { sendSecurityAlertEmail } from '@/lib/mailer';

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

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '不明';
    const userAgent = req.headers.get('user-agent') || '不明なブラウザ';

    if (action === 'update_profile') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'お名前を入力してください。' }, { status: 400 });
      }
      const updatedUser = updateProfile(payload.email, name);
      const newToken = generateSessionToken(updatedUser);

      // プロフィール更新時のセキュリティ通知メール（非同期）
      sendSecurityAlertEmail({
        toEmail: updatedUser.email,
        userName: updatedUser.name,
        type: 'profile_updated',
        ipAddress,
        userAgent,
      }).catch((e: any) => console.warn('Profile update alert email error:', e));

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

      // パスワード変更時のセキュリティ通知メール（非同期）
      sendSecurityAlertEmail({
        toEmail: payload.email,
        userName: payload.name,
        type: 'password_changed',
        ipAddress,
        userAgent,
      }).catch((e: any) => console.warn('Password change alert email error:', e));

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
