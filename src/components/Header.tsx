import React from 'react';
import { getFormattedCurrentDate } from '../lib/date';
import './Header.css';

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  progressRate: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  completedCount,
  progressRate,
}) => {
  const currentDate = getFormattedCurrentDate();

  return (
    <header className="todo-header">
      <div className="header-top">
        <div className="header-titles">
          <time className="header-date" dateTime={new Date().toISOString().split('T')[0]}>
            {currentDate}
          </time>
          <h1 className="header-main-title">나의 할 일</h1>
          <p className="header-subtitle">작은 실천으로 채우는 하루</p>
        </div>
        <div className="header-stats-badge">
          <span className="stats-numbers">
            <strong className="stats-highlight">{completedCount}</strong> / {totalCount} 완료
          </span>
          <span className="stats-percentage">{progressRate}%</span>
        </div>
      </div>

      <div className="progress-container">
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="할 일 진행률"
          aria-valuenow={progressRate}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-fill"
            style={{ width: `${progressRate}%` }}
          />
        </div>
      </div>
    </header>
  );
};
