import React from 'react';
import { CloseIcon, UndoIcon } from './Icons';
import './UndoToast.css';

interface UndoToastProps {
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ onUndo, onDismiss }) => {
  return (
    <aside
      className="undo-toast-container"
      role="status"
      aria-live="polite"
      aria-label="삭제 알림"
    >
      <div className="undo-toast">
        <span className="toast-text">할 일을 삭제했어요.</span>
        <div className="toast-actions">
          <button
            type="button"
            className="undo-btn"
            onClick={onUndo}
            aria-label="삭제한 할 일 복원하기"
          >
            <UndoIcon size={16} />
            <span>실행 취소</span>
          </button>
          <button
            type="button"
            className="toast-close-btn"
            onClick={onDismiss}
            aria-label="알림 닫기"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
