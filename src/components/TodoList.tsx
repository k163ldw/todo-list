import React, { useRef } from 'react';
import { Task, FilterType } from '../types/todo';
import { TodoItem } from './TodoItem';
import './TodoList.css';

interface TodoListProps {
  tasks: Task[];
  filteredTasks: Task[];
  currentFilter: FilterType;
  searchQuery: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
  onClearSearch: () => void;
  onResetFilter: () => void;
  onFocusInput: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  filteredTasks,
  currentFilter,
  searchQuery,
  onToggle,
  onUpdate,
  onDelete,
  onClearSearch,
  onResetFilter,
  onFocusInput,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  // 개별 항목 삭제 시 포커스가 사라지지 않도록 다음 또는 이전 항목, 없으면 입력창으로 포커스 이동
  const handleDeleteWithFocus = (id: string) => {
    const currentIndex = filteredTasks.findIndex(t => t.id === id);
    onDelete(id);

    setTimeout(() => {
      if (!listRef.current) return;
      const buttons = listRef.current.querySelectorAll<HTMLButtonElement>('.delete-btn');
      if (buttons.length > 0) {
        // 다음 항목의 삭제 버튼, 없으면 마지막 항목의 삭제 버튼
        const nextTargetIndex = Math.min(currentIndex, buttons.length - 1);
        buttons[nextTargetIndex]?.focus();
      } else {
        // 남은 항목이 없으면 메인 입력창으로 포커스 복귀
        onFocusInput();
      }
    }, 50);
  };

  // 1. 전체 데이터가 비어 있는 경우
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">아직 할 일이 없어요</p>
        <p className="empty-desc">첫 할 일을 입력해 보세요.</p>
        <button
          type="button"
          className="empty-action-btn"
          onClick={onFocusInput}
        >
          할 일 입력하기
        </button>
      </div>
    );
  }

  // 2. 검색어가 있고 검색 결과가 없는 경우
  if (searchQuery.trim().length > 0 && filteredTasks.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">일치하는 할 일이 없어요</p>
        <p className="empty-desc">입력하신 검색어와 일치하는 항목이 없습니다.</p>
        <button
          type="button"
          className="empty-action-btn"
          onClick={onClearSearch}
        >
          검색어 초기화
        </button>
      </div>
    );
  }

  // 3. 필터 조건에 맞는 항목이 없는 경우
  if (filteredTasks.length === 0) {
    if (currentFilter === 'active') {
      return (
        <div className="empty-state">
          <p className="empty-title">진행 중인 할 일이 없어요</p>
          <p className="empty-desc">모든 할 일을 마쳤거나 새로운 할 일을 추가해 보세요.</p>
          <button
            type="button"
            className="empty-action-btn"
            onClick={onResetFilter}
          >
            전체 보기
          </button>
        </div>
      );
    }

    if (currentFilter === 'completed') {
      return (
        <div className="empty-state">
          <p className="empty-title">아직 완료한 할 일이 없어요</p>
          <p className="empty-desc">할 일을 하나씩 완료해 나가 보세요!</p>
          <button
            type="button"
            className="empty-action-btn"
            onClick={onResetFilter}
          >
            전체 보기
          </button>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <p className="empty-title">이 조건에 맞는 할 일이 없어요</p>
        <button
          type="button"
          className="empty-action-btn"
          onClick={onResetFilter}
        >
          전체 보기
        </button>
      </div>
    );
  }

  return (
    <ul className="todo-list" ref={listRef} aria-label="할 일 목록">
      {filteredTasks.map(task => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={handleDeleteWithFocus}
        />
      ))}
    </ul>
  );
};
