'use client';

/**
 * ゲスト診断データ（回答、ニックネーム、進捗インデックス）をlocalStorageから安全に消去する
 * ※ Stripe顧客情報や有料プラン権限、診断履歴一覧は保護し、入力フォームと進行状態のみをクリーンにリセットします
 */
export function resetDiagnosticSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('kokoro_navi_answers_v2');
    localStorage.removeItem('kokoro_navi_nickname_v2');
    localStorage.removeItem('kokoro_navi_current_index_v2');
  } catch (e) {
    console.warn('Failed to reset diagnostic session:', e);
  }
}
