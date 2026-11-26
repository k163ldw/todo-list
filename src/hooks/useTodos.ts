import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, FilterType, DeletedTaskRecord } from '../types/todo';
import { loadTasksFromStorage, saveTasksToStorage } from '../lib/storage';

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedRecord, setDeletedRecord] = useState<DeletedTaskRecord | null>(null);
  const [newlyAddedHidden, setNewlyAddedHidden] = useState(false);
  const [storageError, setStorageError] = useState<
    'PARSE_ERROR' | 'INVALID_SCHEMA' | 'HIGHER_VERSION' | 'SAVE_FAILED' | null
  >(null);
  const [rawCorruptedData, setRawCorruptedData] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로컬 스토리지 로드
  useEffect(() => {
    const result = loadTasksFromStorage();
    if (result.error) {
      setStorageError(result.error);
      setRawCorruptedData(result.rawCorruptedData || null);
    } else {
      setTasks(result.tasks);
    }
    setIsInitialized(true);
  }, []);

  // 상태 변경 시 로컬 스토리지 자동 저장
  const syncStorage = useCallback((updatedTasks: Task[]) => {
    const success = saveTasksToStorage(updatedTasks);
    if (!success) {
      setStorageError('SAVE_FAILED');
    } else {
      // 이전에 저장 실패 상태였다면 성공 시 복구
      setStorageError(prev => (prev === 'SAVE_FAILED' ? null : prev));
    }
  }, []);

  // 할 일 추가
  const addTask = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) {
      return false;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: trimmed,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTasks(prev => {
      const next = [newTask, ...prev];
      syncStorage(next);
      return next;
    });

    // 현재 필터/검색 조건에 새 할 일이 맞지 않아 목록에서 숨겨지는지 확인
    const matchesFilter = filter === 'all' || filter === 'active';
    const matchesSearch = !searchQuery.trim() || trimmed.toLowerCase().includes(searchQuery.trim().toLowerCase());

    if (!matchesFilter || !matchesSearch) {
      setNewlyAddedHidden(true);
    } else {
      setNewlyAddedHidden(false);
    }

    return true;
  }, [filter, searchQuery, syncStorage]);

  // 완료 상태 토글
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            completed: !t.completed,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      syncStorage(next);
      return next;
    });
  }, [syncStorage]);

  // 할 일 내용 수정
  const updateTaskText = useCallback((id: string, newText: string): boolean => {
    const trimmed = newText.trim();
    if (!trimmed || trimmed.length > 200) {
      return false;
    }

    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            text: trimmed,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      syncStorage(next);
      return next;
    });
    return true;
  }, [syncStorage]);

  // 개별 삭제 (실행 취소 레코드 저장)
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const targetIndex = prev.findIndex(t => t.id === id);
      if (targetIndex === -1) return prev;

      const targetTask = prev[targetIndex];
      // 최신 삭제 1건만 실행 취소 대상
      setDeletedRecord({ task: targetTask, originalIndex: targetIndex });

      const next = prev.filter(t => t.id !== id);
      syncStorage(next);
      return next;
    });
  }, [syncStorage]);

  // 삭제 실행 취소
  const undoDelete = useCallback(() => {
    if (!deletedRecord) return;

    setTasks(prev => {
      const next = [...prev];
      // 원래 위치로 복원 (인덱스가 범위를 벗어나면 끝에 추가)
      const insertIndex = Math.min(deletedRecord.originalIndex, next.length);
      next.splice(insertIndex, 0, deletedRecord.task);
      syncStorage(next);
      return next;
    });

    setDeletedRecord(null);
  }, [deletedRecord, syncStorage]);

  // 실행 취소 알림 닫기
  const dismissUndo = useCallback(() => {
    setDeletedRecord(null);
  }, []);

  // 완료 항목 일괄 삭제
  const clearCompleted = useCallback(() => {
    setTasks(prev => {
      const next = prev.filter(t => !t.completed);
      syncStorage(next);
      return next;
    });
    // 일괄 삭제 시 개별 실행 취소 레코드는 무효화
    setDeletedRecord(null);
  }, [syncStorage]);

  // 손상된 로컬스토리지 초기화 및 재시작
  const resetCorruptedData = useCallback(() => {
    localStorage.removeItem('todo-app:v1');
    setStorageError(null);
    setRawCorruptedData(null);
    setTasks([]);
  }, []);

  // 전체 보기로 필터/검색 리셋
  const resetFilterAndSearch = useCallback(() => {
    setFilter('all');
    setSearchQuery('');
    setNewlyAddedHidden(false);
  }, []);

  // 통계 계산
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const remainingCount = totalCount - completedCount;
  const progressRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // 필터 및 검색 적용된 목록
  const filteredTasks = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return tasks.filter(task => {
      // 1. 상태 필터
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;

      // 2. 검색어 필터 (부분 문자열 매칭)
      if (trimmedQuery && !task.text.toLowerCase().includes(trimmedQuery)) {
        return false;
      }

      return true;
    });
  }, [tasks, filter, searchQuery]);

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deletedRecord,
    newlyAddedHidden,
    storageError,
    rawCorruptedData,
    isInitialized,
    totalCount,
    completedCount,
    remainingCount,
    progressRate,
    addTask,
    toggleTask,
    updateTaskText,
    deleteTask,
    undoDelete,
    dismissUndo,
    clearCompleted,
    resetCorruptedData,
    resetFilterAndSearch,
  };
}
