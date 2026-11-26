import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../lib/storage';
import { Task } from '../types/todo';

describe('storage 유틸리티 검증', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('빈 스토리지에서는 빈 배열과 에러 없음을 반환한다', () => {
    const result = loadTasksFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  it('정상적인 데이터를 저장하고 복원할 수 있다', () => {
    const sampleTasks: Task[] = [
      {
        id: 'task-1',
        text: '첫 번째 할 일',
        completed: false,
        createdAt: '2026-11-26T10:00:00.000Z',
        updatedAt: '2026-11-26T10:00:00.000Z',
      },
    ];

    const saved = saveTasksToStorage(sampleTasks);
    expect(saved).toBe(true);

    const result = loadTasksFromStorage();
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].text).toBe('첫 번째 할 일');
    expect(result.error).toBeUndefined();
  });

  it('JSON 파싱이 불가능한 손상된 데이터는 PARSE_ERROR를 반환하고 원본을 보존한다', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json string ...');

    const result = loadTasksFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBe('PARSE_ERROR');
    expect(result.rawCorruptedData).toBe('{ invalid json string ...');
  });

  it('잘못된 스키마(객체가 아님, 필드 누락 등)는 INVALID_SCHEMA를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, tasks: 'not-an-array' })
    );

    const result = loadTasksFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBe('INVALID_SCHEMA');
  });

  it('상위 스키마 버전 데이터는 HIGHER_VERSION을 반환하고 변환하지 않는다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION + 1,
        tasks: [],
      })
    );

    const result = loadTasksFromStorage();
    expect(result.tasks).toEqual([]);
    expect(result.error).toBe('HIGHER_VERSION');
  });

  it('중복 ID가 있는 잘못된 데이터는 무결성 보호를 위해 에러로 처리한다', () => {
    const duplicated = {
      schemaVersion: 1,
      tasks: [
        {
          id: 'same-id',
          text: '할 일 1',
          completed: false,
          createdAt: '2026-11-26T10:00:00.000Z',
          updatedAt: '2026-11-26T10:00:00.000Z',
        },
        {
          id: 'same-id',
          text: '할 일 2',
          completed: false,
          createdAt: '2026-11-26T11:00:00.000Z',
          updatedAt: '2026-11-26T11:00:00.000Z',
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(duplicated));

    const result = loadTasksFromStorage();
    expect(result.error).toBe('INVALID_SCHEMA');
  });
});
