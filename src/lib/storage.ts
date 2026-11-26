import { StorageData, Task } from '../types/todo';

export const STORAGE_KEY = 'todo-app:v1';
export const CURRENT_SCHEMA_VERSION = 1;

export interface StorageLoadResult {
  tasks: Task[];
  error?: 'PARSE_ERROR' | 'INVALID_SCHEMA' | 'HIGHER_VERSION' | null;
  rawCorruptedData?: string | null;
}

/**
 * Task 객체의 유효성을 엄격하게 검증합니다.
 */
function isValidTask(item: unknown, seenIds: Set<string>): item is Task {
  if (!item || typeof item !== 'object') return false;
  const t = item as Record<string, unknown>;

  if (typeof t.id !== 'string' || !t.id.trim()) return false;
  if (seenIds.has(t.id)) return false; // 중복 ID 차단
  seenIds.add(t.id);

  if (typeof t.text !== 'string' || !t.text.trim()) return false;
  if (typeof t.completed !== 'boolean') return false;

  if (typeof t.createdAt !== 'string' || Number.isNaN(Date.parse(t.createdAt))) return false;
  if (typeof t.updatedAt !== 'string' || Number.isNaN(Date.parse(t.updatedAt))) return false;

  return true;
}

/**
 * localStorage로부터 할 일 목록을 안전하게 로드합니다.
 * 스키마 검증 실패 시 기존 원본을 덮어쓰지 않고 에러를 보고합니다.
 */
export function loadTasksFromStorage(): StorageLoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tasks: [] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { tasks: [], error: 'PARSE_ERROR', rawCorruptedData: raw };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { tasks: [], error: 'INVALID_SCHEMA', rawCorruptedData: raw };
    }

    const data = parsed as Partial<StorageData>;

    if (typeof data.schemaVersion !== 'number') {
      return { tasks: [], error: 'INVALID_SCHEMA', rawCorruptedData: raw };
    }

    if (data.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return { tasks: [], error: 'HIGHER_VERSION', rawCorruptedData: raw };
    }

    if (!Array.isArray(data.tasks)) {
      return { tasks: [], error: 'INVALID_SCHEMA', rawCorruptedData: raw };
    }

    const seenIds = new Set<string>();
    const validTasks: Task[] = [];

    for (const item of data.tasks) {
      if (isValidTask(item, seenIds)) {
        validTasks.push({
          id: item.id,
          text: item.text,
          completed: item.completed,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      } else {
        // 일부 레코드가 손상된 경우에도 데이터 보호를 위해 에러 플래그 설정
        return { tasks: [], error: 'INVALID_SCHEMA', rawCorruptedData: raw };
      }
    }

    // createdAt 내림차순 정렬 보장
    validTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { tasks: validTasks };
  } catch {
    return { tasks: [], error: 'PARSE_ERROR' };
  }
}

/**
 * 할 일 목록을 localStorage에 저장합니다.
 * 실패 시 false를 반환하여 호출 측에서 사용자에게 실패를 고지할 수 있도록 합니다.
 */
export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    const payload: StorageData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('localStorage 저장 실패:', err);
    return false;
  }
}
