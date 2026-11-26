import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  count,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // 열릴 때 취소 버튼에 초기 포커스
      cancelBtnRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Esc 키 또는 dialog 기본 cancel 이벤트 처리
  const handleCancelEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancel();
  };

  // 배경(Backdrop) 클릭 시 취소 처리
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  // 키보드 포커스 트랩 처리 (Tab 순환)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
      if (focusable.length < 2) return;

      if (e.shiftKey) {
        if (document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[1]?.focus();
        }
      } else {
        if (document.activeElement === focusable[1]) {
          e.preventDefault();
          focusable[0]?.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onClick={handleBackdropClick}
      onCancel={handleCancelEvent}
      onKeyDown={handleKeyDown}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="dialog-content">
        <h2 id="confirm-dialog-title" className="dialog-title">
          완료한 할 일을 삭제할까요?
        </h2>
        <p id="confirm-dialog-desc" className="dialog-description">
          완료한 할 일 <strong>{count}</strong>개가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>

        <div className="dialog-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="dialog-btn cancel-btn"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="dialog-btn delete-confirm-btn"
            onClick={onConfirm}
          >
            {count}개 삭제
          </button>
        </div>
      </div>
    </dialog>
  );
};
