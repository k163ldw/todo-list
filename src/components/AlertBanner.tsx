import React from 'react';
import './AlertBanner.css';

interface AlertBannerProps {
  newlyAddedHidden?: boolean;
  storageError?: 'PARSE_ERROR' | 'INVALID_SCHEMA' | 'HIGHER_VERSION' | 'SAVE_FAILED' | null;
  onResetFilterAndSearch?: () => void;
  onResetCorruptedData?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  newlyAddedHidden,
  storageError,
  onResetFilterAndSearch,
  onResetCorruptedData,
}) => {
  if (storageError && storageError !== 'SAVE_FAILED') {
    return (
      <div className="alert-banner error-banner" role="alert">
        <div className="alert-content">
          <p className="alert-message">
            저장된 목록을 읽지 못했어요. 기존 데이터는 덮어쓰지 않았습니다.
          </p>
          {onResetCorruptedData && (
            <button
              type="button"
              className="alert-action-btn danger-action"
              onClick={() => {
                if (window.confirm('기존 저장 공간을 초기화하고 새 목록으로 시작할까요?')) {
                  onResetCorruptedData();
                }
              }}
            >
              초기화 후 새로 시작
            </button>
          )}
        </div>
      </div>
    );
  }

  if (newlyAddedHidden) {
    return (
      <div className="alert-banner info-banner" role="status">
        <div className="alert-content">
          <p className="alert-message">
            할 일을 추가했어요. 현재 필터/검색 조건에서는 보이지 않습니다.
          </p>
          {onResetFilterAndSearch && (
            <button
              type="button"
              className="alert-action-btn primary-action"
              onClick={onResetFilterAndSearch}
            >
              전체 보기
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
