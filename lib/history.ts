import { DistortionScoreItem } from './personality';

export interface DiagnosticHistoryItem {
  id: string;
  timestamp: number; // Unix timestamp ms
  formattedDate: string; // YYYY/MM/DD HH:mm
  userName: string;
  type: string;
  title: string;
  shortName: string;
  fatigueScore: number;
  fatigueLevel: number;
  fatigueStatus: string;
  topDistortions: {
    type: string;
    name: string;
    percentage: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  axes: {
    EI: { label: string; strength: number };
    SN: { label: string; strength: number };
    TF: { label: string; strength: number };
    JP: { label: string; strength: number };
  };
  answersCount: number;
}

const STORAGE_KEY_HISTORY = 'kokoro_navi_diagnostic_history_v1';

/**
 * 過去の診断履歴を localStorage から取得する
 */
export function getDiagnosticHistories(): DiagnosticHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (e) {
    console.error('Failed to load diagnostic histories:', e);
    return [];
  }
}

/**
 * 新しい診断結果を履歴に保存する（直近30件保持、重複防止）
 */
export function saveDiagnosticHistory(
  item: Omit<DiagnosticHistoryItem, 'id' | 'timestamp' | 'formattedDate'>
): DiagnosticHistoryItem {
  const histories = getDiagnosticHistories();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  const newItem: DiagnosticHistoryItem = {
    ...item,
    id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    formattedDate,
  };

  // 直近2分以内の同一タイプ・スコアの多重保存を防止
  const isDuplicate = histories.length > 0 && 
    histories[0].type === newItem.type &&
    histories[0].fatigueScore === newItem.fatigueScore &&
    (Date.now() - histories[0].timestamp < 120000);

  let updated: DiagnosticHistoryItem[];
  if (isDuplicate) {
    updated = [newItem, ...histories.slice(1)];
  } else {
    updated = [newItem, ...histories].slice(0, 30); // 最大30件
  }

  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save diagnostic history to localStorage:', e);
  }

  return newItem;
}

/**
 * 特定の診断履歴を削除する
 */
export function removeDiagnosticHistory(id: string): DiagnosticHistoryItem[] {
  const histories = getDiagnosticHistories();
  const filtered = histories.filter((h) => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove diagnostic history:', e);
  }
  return filtered;
}

/**
 * 履歴全件削除
 */
export function clearDiagnosticHistories(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    console.error('Failed to clear diagnostic histories:', e);
  }
}
