import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  isPremium?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
  salt: string;
}

export interface SessionData {
  user: User;
  token: string;
  expiresAt: number;
}

const JWT_SECRET = process.env.AUTH_SECRET || 'kokoro-navi-secure-auth-secret-key-2026';

// ------------------------------------------------------------
// ログイン試行回数の制限（スロットリング / ブルートフォース保護）
// ------------------------------------------------------------
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __KOKORO_LOGIN_LIMITS__: Map<string, RateLimitRecord> | undefined;
}

if (!global.__KOKORO_LOGIN_LIMITS__) {
  global.__KOKORO_LOGIN_LIMITS__ = new Map<string, RateLimitRecord>();
}

const loginLimits = global.__KOKORO_LOGIN_LIMITS__;

const MAX_LOGIN_ATTEMPTS = 5; // 連続失敗5回でロック
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15分間ロックアウト

/**
 * ログイン試行制限のチェック
 */
export function checkLoginRateLimit(key: string): { isLocked: boolean; remainingMinutes?: number } {
  const normalizedKey = key.trim().toLowerCase();
  const record = loginLimits.get(normalizedKey);
  if (!record) return { isLocked: false };

  const now = Date.now();
  if (record.lockoutUntil > now) {
    const remainingMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
    return { isLocked: true, remainingMinutes };
  }

  // ロックアウト期限が過ぎている場合はリセット
  if (record.lockoutUntil > 0 && record.lockoutUntil <= now) {
    loginLimits.delete(normalizedKey);
  }

  return { isLocked: false };
}

/**
 * ログイン失敗の記録
 */
export function recordLoginFailure(key: string): { attempts: number; isLocked: boolean; remainingMinutes?: number } {
  const normalizedKey = key.trim().toLowerCase();
  const now = Date.now();
  const record = loginLimits.get(normalizedKey) || { attempts: 0, lockoutUntil: 0 };

  record.attempts += 1;
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    loginLimits.set(normalizedKey, record);
    return {
      attempts: record.attempts,
      isLocked: true,
      remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000),
    };
  }

  loginLimits.set(normalizedKey, record);
  return { attempts: record.attempts, isLocked: false };
}

/**
 * ログイン成功時のカウントリセット
 */
export function resetLoginRateLimit(key: string): void {
  const normalizedKey = key.trim().toLowerCase();
  loginLimits.delete(normalizedKey);
}

declare global {
  // eslint-disable-next-line no-var
  var __KOKORO_USERS_STORE__: Map<string, UserWithPassword> | undefined;
}

if (!global.__KOKORO_USERS_STORE__) {
  global.__KOKORO_USERS_STORE__ = new Map<string, UserWithPassword>();
}

const usersStore = global.__KOKORO_USERS_STORE__;

/**
 * パスワードのハッシュ化（PBKDF2）
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * パスワードの検証
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * 簡易JWTライクな安全なセッショントークン生成
 */
export function generateSessionToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間有効
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * セッショントークンの検証とユーザー復元
 */
export function verifySessionToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;

    return { userId: payload.userId, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

/**
 * 通常のメールアドレス・パスワードによる新規登録
 */
export function registerUser(email: string, password: string, name: string): { user: User; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (usersStore.has(normalizedEmail)) {
    throw new Error('既にこのメールアドレスは登録されています。');
  }

  const { hash, salt } = hashPassword(password);
  const userRecord: UserWithPassword = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: normalizedEmail,
    name: name.trim() || 'ゲスト',
    createdAt: Date.now(),
    passwordHash: hash,
    salt,
  };

  usersStore.set(normalizedEmail, userRecord);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt: _, ...safeUser } = userRecord;
  const token = generateSessionToken(safeUser);

  return { user: safeUser, token };
}

/**
 * 通常のログイン
 */
export function loginUser(email: string, password: string): { user: User; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);

  if (!userRecord) {
    throw new Error('メールアドレスまたはパスワードが正しくありません。');
  }

  const isValid = verifyPassword(password, userRecord.passwordHash, userRecord.salt);
  if (!isValid) {
    throw new Error('メールアドレスまたはパスワードが正しくありません。');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt: _, ...safeUser } = userRecord;
  const token = generateSessionToken(safeUser);

  return { user: safeUser, token };
}

/**
 * ユーザー情報の取得（Emailから）
 */
export function getUserByEmail(email: string): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);
  if (!userRecord) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt: _, ...safeUser } = userRecord;
  return safeUser;
}

/**
 * ユーザーのStripe購入状態更新
 */
export function updateUserSubscription(
  email: string,
  data: { isPremium?: boolean; stripeCustomerId?: string; stripeSubscriptionId?: string }
): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);
  if (!userRecord) return null;

  if (data.isPremium !== undefined) userRecord.isPremium = data.isPremium;
  if (data.stripeCustomerId) userRecord.stripeCustomerId = data.stripeCustomerId;
  if (data.stripeSubscriptionId) userRecord.stripeSubscriptionId = data.stripeSubscriptionId;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt: _, ...safeUser } = userRecord;
  return safeUser;
}

/**
 * ユーザープロフィールの更新（名前の変更）
 */
export function updateProfile(email: string, name: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);
  if (!userRecord) {
    throw new Error('ユーザーが見つかりません。');
  }
  userRecord.name = name.trim() || 'ゲスト';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt: _, ...safeUser } = userRecord;
  return safeUser;
}

/**
 * パスワード変更
 */
export function changePassword(email: string, oldPassword: string, newPassword: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);
  if (!userRecord) {
    throw new Error('ユーザーが見つかりません。');
  }

  const isValid = verifyPassword(oldPassword, userRecord.passwordHash, userRecord.salt);
  if (!isValid) {
    throw new Error('現在のパスワードが正しくありません。');
  }

  if (newPassword.length < 6) {
    throw new Error('新しいパスワードは6文字以上で指定してください。');
  }

  const { hash, salt } = hashPassword(newPassword);
  userRecord.passwordHash = hash;
  userRecord.salt = salt;
  return true;
}

/**
 * アカウント削除（退会処理）
 */
export function deleteAccount(email: string, password?: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = usersStore.get(normalizedEmail);
  if (!userRecord) {
    throw new Error('ユーザーが見つかりません。');
  }

  if (!password) {
    throw new Error('パスワードを入力してください。');
  }

  const isValid = verifyPassword(password, userRecord.passwordHash, userRecord.salt);
  if (!isValid) {
    throw new Error('パスワードが正しくありません。');
  }

  usersStore.delete(normalizedEmail);
  return true;
}
