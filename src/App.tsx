import React, { useState, useRef } from 'react';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { FilterSearch } from './components/FilterSearch';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UndoToast } from './components/UndoToast';
import { AlertBanner } from './components/AlertBanner';
import './App.css';

export const App: React.FC = () => {
  const {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deletedRecord,
    newlyAddedHidden,
    storageError,
    totalCount,
    completedCount,
    remainingCount,
    progressRate,
    addTask,
    toggleTask,
    updateTaskText,
    deleteTask,
    undoDelete,
    dismissUndo,
    clearCompleted,
    resetCorruptedData,
    resetFilterAndSearch,
  } = useTodos();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  // 새 할 일 입력창으로 포커스 이동 함수
  const focusMainInput = () => {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    input?.focus();
  };

  // 일괄 삭제 확인 모달 열기
  const handleOpenClearDialog = () => {
    setIsConfirmOpen(true);
  };

  // 일괄 삭제 실행
  const handleConfirmClear = () => {
    clearCompleted();
    setIsConfirmOpen(false);
    // 일괄 삭제 후 버튼이 disabled되므로 가까운 유효 요소인 입력창으로 포커스 복귀
    setTimeout(() => {
      focusMainInput();
    }, 0);
  };

  // 일괄 삭제 취소
  const handleCancelClear = () => {
    setIsConfirmOpen(false);
    // 취소 시에는 버튼이 여전히 활성화되어 있으므로 원래 호출 버튼으로 복귀
    setTimeout(() => {
      clearButtonRef.current?.focus();
    }, 0);
  };

  return (
    <main className="todo-app-card">
      <Header
        totalCount={totalCount}
        completedCount={completedCount}
        progressRate={progressRate}
      />

      <AlertBanner
        newlyAddedHidden={newlyAddedHidden}
        storageError={storageError}
        onResetFilterAndSearch={resetFilterAndSearch}
        onResetCorruptedData={resetCorruptedData}
      />

      <TodoInput onAdd={addTask} />

      <FilterSearch
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalFilteredCount={filteredTasks.length}
      />

      <TodoList
        tasks={tasks}
        filteredTasks={filteredTasks}
        currentFilter={filter}
        searchQuery={searchQuery}
        onToggle={toggleTask}
        onUpdate={updateTaskText}
        onDelete={deleteTask}
        onClearSearch={() => setSearchQuery('')}
        onResetFilter={() => setFilter('all')}
        onFocusInput={focusMainInput}
      />

      <Footer
        ref={clearButtonRef}
        remainingCount={remainingCount}
        completedCount={completedCount}
        onOpenClearDialog={handleOpenClearDialog}
        storageError={storageError}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        count={completedCount}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />

      {deletedRecord && (
        <UndoToast onUndo={undoDelete} onDismiss={dismissUndo} />
      )}
    </main>
  );
};

export default App;
