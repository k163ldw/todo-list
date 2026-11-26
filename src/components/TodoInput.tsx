import React, { useState, useRef, useCallback } from 'react';
import './TodoInput.css';

interface TodoInputProps {
  onAdd: (text: string) => boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (isComposing) {
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        setErrorMessage('할 일을 입력해 주세요.');
        inputRef.current?.focus();
        return;
      }

      if (trimmed.length > 200) {
        setErrorMessage('할 일은 최대 200자까지 입력할 수 있습니다.');
        inputRef.current?.focus();
        return;
      }

      const success = onAdd(trimmed);
      if (success) {
        setText('');
        setErrorMessage(null);
        // 등록 후 입력창 포커스 유지
        inputRef.current?.focus();
      }
    },
    [text, isComposing, onAdd]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중(isComposing === true) Enter 키는 완료 전 전송 방지
    if (e.key === 'Enter') {
      if (isComposing || e.nativeEvent.isComposing) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 200);
    setText(val);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-todo-input" className="sr-only">
        새 할 일
      </label>

      <div className="input-row">
        <div className="input-field-wrapper">
          <input
            id="new-todo-input"
            ref={inputRef}
            type="text"
            className={`todo-input ${errorMessage ? 'has-error' : ''} ${text.length > 0 ? 'has-char-count' : ''}`}
            placeholder="어떤 일을 할 예정인가요?"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            maxLength={200}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? 'todo-input-error' : undefined}
            autoComplete="off"
          />
          {text.length > 0 && (
            <span className="char-counter" aria-hidden="true">
              {text.length}/200
            </span>
          )}
        </div>

        <button type="submit" className="add-button" aria-label="할 일 추가">
          추가
        </button>
      </div>

      {errorMessage && (
        <p id="todo-input-error" className="input-error-message" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
};
