import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types/todo';
import { EditIcon, TrashIcon, CheckIcon } from './Icons';
import './TodoItem.css';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editError, setEditError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // 수정 모드 진입 시 입력창에 자동 포커스
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(task.text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(task.text);
    setEditError(null);
    // 수정 취소 후 수정 버튼으로 포커스 복귀
    setTimeout(() => {
      editButtonRef.current?.focus();
    }, 0);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError('할 일을 입력해 주세요.');
      editInputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setEditError('할 일은 최대 200자까지 입력할 수 있습니다.');
      editInputRef.current?.focus();
      return;
    }

    const success = onUpdate(task.id, trimmed);
    if (success) {
      setIsEditing(false);
      setEditError(null);
      // 저장 후 수정 버튼으로 포커스 복귀
      setTimeout(() => {
        editButtonRef.current?.focus();
      }, 0);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter') {
      if (isComposing || e.nativeEvent.isComposing) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleSaveEdit();
    }
  };

  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="item-edit-mode">
          <label htmlFor={`edit-input-${task.id}`} className="sr-only">
            할 일 내용 수정
          </label>
          <div className="edit-input-wrapper">
            <input
              id={`edit-input-${task.id}`}
              ref={editInputRef}
              type="text"
              className={`edit-input ${editError ? 'has-error' : ''}`}
              value={editText}
              onChange={e => {
                setEditText(e.target.value);
                if (editError) setEditError(null);
              }}
              onKeyDown={handleEditKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              maxLength={200}
              aria-label={`할 일 "${task.text}" 내용 수정`}
              aria-invalid={!!editError}
              aria-describedby={editError ? `edit-error-${task.id}` : undefined}
            />
            {editError && (
              <span id={`edit-error-${task.id}`} className="edit-error-text" role="alert">
                {editError}
              </span>
            )}
          </div>
          <div className="edit-actions">
            <button
              type="button"
              className="edit-save-btn"
              onClick={handleSaveEdit}
              aria-label={`할 일 "${task.text}" 수정 저장`}
            >
              저장
            </button>
            <button
              type="button"
              className="edit-cancel-btn"
              onClick={handleCancelEdit}
              aria-label="수정 취소"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="item-view-mode">
          <div className="item-main-content">
            <label className="checkbox-label" htmlFor={`todo-checkbox-${task.id}`}>
              <input
                id={`todo-checkbox-${task.id}`}
                type="checkbox"
                className="sr-only native-checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
              />
              <span className="custom-checkbox" aria-hidden="true">
                {task.completed && <CheckIcon size={14} />}
              </span>
              <span className="todo-text">{task.text}</span>
            </label>
          </div>

          <div className="item-action-buttons">
            <button
              ref={editButtonRef}
              type="button"
              className="action-btn edit-btn"
              onClick={handleStartEdit}
              aria-label={`할 일 "${task.text}" 내용 수정`}
              title="수정"
            >
              <EditIcon size={18} />
              <span className="action-text">수정</span>
            </button>
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={() => onDelete(task.id)}
              aria-label={`할 일 "${task.text}" 삭제`}
              title="삭제"
            >
              <TrashIcon size={18} />
              <span className="action-text">삭제</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
