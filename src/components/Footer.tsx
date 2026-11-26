import { forwardRef } from 'react';
import './Footer.css';

interface FooterProps {
  remainingCount: number;
  completedCount: number;
  onOpenClearDialog: () => void;
  storageError: 'PARSE_ERROR' | 'INVALID_SCHEMA' | 'HIGHER_VERSION' | 'SAVE_FAILED' | null;
}

export const Footer = forwardRef<HTMLButtonElement, FooterProps>(
  ({ remainingCount, completedCount, onOpenClearDialog, storageError }, ref) => {
    return (
      <footer className="todo-footer">
        <div className="footer-status-row">
          <span className="remaining-count">
            남은 할 일 <strong className="count-number">{remainingCount}</strong>개
          </span>

          <button
            ref={ref}
            type="button"
            className="clear-completed-btn"
            disabled={completedCount === 0}
            onClick={onOpenClearDialog}
            aria-label={`완료한 할 일 ${completedCount}개 일괄 삭제`}
          >
            완료 항목 삭제
          </button>
        </div>

        <div className="footer-storage-info">
          {storageError === 'SAVE_FAILED' ? (
            <p className="storage-msg storage-error" role="alert">
              변경 내용을 이 브라우저에 저장하지 못했어요. 창을 닫으면 사라질 수 있습니다.
            </p>
          ) : (
            <p className="storage-msg">이 브라우저에 자동 저장됩니다.</p>
          )}
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';
