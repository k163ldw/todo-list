import React from 'react';
import { FilterType } from '../types/todo';
import { SearchIcon, CloseIcon } from './Icons';
import './FilterSearch.css';

interface FilterSearchProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalFilteredCount: number;
}

export const FilterSearch: React.FC<FilterSearchProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalFilteredCount,
}) => {
  const filterOptions: { type: FilterType; label: string }[] = [
    { type: 'all', label: '전체' },
    { type: 'active', label: '진행 중' },
    { type: 'completed', label: '완료' },
  ];

  return (
    <div className="filter-search-container">
      <div className="filter-tabs" role="group" aria-label="할 일 상태 필터">
        {filterOptions.map(opt => (
          <button
            key={opt.type}
            type="button"
            className={`filter-btn ${currentFilter === opt.type ? 'active' : ''}`}
            aria-pressed={currentFilter === opt.type}
            onClick={() => onFilterChange(opt.type)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="search-bar-wrapper">
        <label htmlFor="todo-search-input" className="sr-only">
          할 일 검색
        </label>
        <span className="search-icon-wrapper" aria-hidden="true">
          <SearchIcon size={18} />
        </span>
        <input
          id="todo-search-input"
          type="search"
          className="search-input"
          placeholder="할 일 검색"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="검색창 비우기"
            onClick={() => onSearchChange('')}
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {searchQuery.trim().length > 0 && (
        <div className="search-result-hint" aria-live="polite">
          검색 결과 <span className="highlight-num">{totalFilteredCount}</span>개
        </div>
      )}
    </div>
  );
};
