import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getUserByEmail } from '@/lib/auth';

/**
 * ログインユーザーセッション確認
 * GET /api/auth/me
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kokoro_session_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      const res = NextResponse.json({ authenticated: false, user: null });
      res.cookies.delete('kokoro_session_token');
      return res;
    }

    const user = getUserByEmail(payload.email) || {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      createdAt: Date.now(),
    };

    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

/**
 * ログアウト
 * POST /api/auth/logout
 */
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'ログアウトしました。' });
  response.cookies.delete('kokoro_session_token');
  return response;
}
