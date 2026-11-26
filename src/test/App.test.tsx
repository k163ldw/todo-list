import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { STORAGE_KEY } from '../lib/storage';

describe('TodoList 웹앱 통합 기능 검증', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('초기 화면에서 빈 상태와 0% 진행률을 올바르게 표시한다', () => {
    render(<App />);

    expect(screen.getByText('꼭 해야할 일')).toBeInTheDocument();
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    const stats = screen.getByText((_, element) => element?.classList.contains('stats-numbers') ?? false);
    expect(stats.textContent?.replace(/\s+/g, ' ').trim()).toBe('0 / 0 완료');
  });

  it('할 일을 추가하면 목록 상단에 등록되고 진행 현황이 갱신된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    // 앞뒤 공백 포함 입력 시 공백 제거 후 등록
    fireEvent.change(input, { target: { value: '  React 공부하기  ' } });
    fireEvent.click(addButton);

    expect(screen.getByText('React 공부하기')).toBeInTheDocument();
    expect(input).toHaveValue('');
    const stats = screen.getByText((_, element) => element?.classList.contains('stats-numbers') ?? false);
    expect(stats.textContent?.replace(/\s+/g, ' ').trim()).toBe('0 / 1 완료');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('공백만 입력하거나 빈 문자열로 추가 시 오류 메시지를 표시하고 등록을 차단한다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    fireEvent.change(input, { target: { value: '    ' } });
    fireEvent.click(addButton);

    expect(screen.getByText('할 일을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
  });

  it('한글 IME 조합 중(isComposing === true) Enter 키 입력 시 등록되지 않는다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');

    fireEvent.change(input, { target: { value: '한글입력중' } });

    // IME 조합 시작
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
    });

    // 아직 등록되지 않음
    expect(screen.queryByText('한글입력중')).not.toBeInTheDocument();
    expect(input).toHaveValue('한글입력중');

    // IME 조합 완료
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      isComposing: false,
    });

    expect(screen.getByText('한글입력중')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('체크박스로 완료/미완료를 전환하고 진행률이 올바르게 계산된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '운동하기' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    // 완료 처리
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    const stats1 = screen.getByText((_, element) => element?.classList.contains('stats-numbers') ?? false);
    expect(stats1.textContent?.replace(/\s+/g, ' ').trim()).toBe('1 / 1 완료');
    expect(screen.getByText('100%')).toBeInTheDocument();

    // 미완료 처리
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    const stats2 = screen.getByText((_, element) => element?.classList.contains('stats-numbers') ?? false);
    expect(stats2.textContent?.replace(/\s+/g, ' ').trim()).toBe('0 / 1 완료');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('수정 버튼으로 내용을 수정하고 Enter로 저장할 수 있다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '원래 내용' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    const editBtn = screen.getByRole('button', { name: /내용 수정/ });
    fireEvent.click(editBtn);

    const editInput = screen.getByDisplayValue('원래 내용');
    fireEvent.change(editInput, { target: { value: '수정된 내용' } });

    fireEvent.keyDown(editInput, {
      key: 'Enter',
      nativeEvent: { isComposing: false },
    });

    expect(screen.getByText('수정된 내용')).toBeInTheDocument();
    expect(screen.queryByText('원래 내용')).not.toBeInTheDocument();
  });

  it('수정 중 Esc 키를 누르면 원래 내용으로 복원되고 수정이 취소된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '취소할 내용' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    const editBtn = screen.getByRole('button', { name: /내용 수정/ });
    fireEvent.click(editBtn);

    const editInput = screen.getByDisplayValue('취소할 내용');
    fireEvent.change(editInput, { target: { value: '바꾸려던 내용' } });

    fireEvent.keyDown(editInput, { key: 'Escape' });

    expect(screen.getByText('취소할 내용')).toBeInTheDocument();
    expect(screen.queryByText('바꾸려던 내용')).not.toBeInTheDocument();
  });

  it('개별 삭제 후 실행 취소(Undo) 시 원래 데이터와 위치로 복원된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    // 항목 2개 추가
    fireEvent.change(input, { target: { value: '첫 번째' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: '두 번째' } });
    fireEvent.click(addButton);

    // 최신순이므로 '두 번째', '첫 번째' 순서
    const deleteBtn = screen.getByRole('button', { name: '할 일 "두 번째" 삭제' });
    fireEvent.click(deleteBtn);

    expect(screen.queryByText('두 번째')).not.toBeInTheDocument();
    expect(screen.getByText('할 일을 삭제했어요.')).toBeInTheDocument();

    // 실행 취소 클릭
    const undoButton = screen.getByRole('button', { name: '삭제한 할 일 복원하기' });
    fireEvent.click(undoButton);

    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('첫 번째')).toBeInTheDocument();
  });

  it('상태 필터와 검색어를 함께 적용할 수 있다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    fireEvent.change(input, { target: { value: '장보기' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: '책 읽기' } });
    fireEvent.click(addButton);

    // '책 읽기' 완료 처리
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // '책 읽기'가 상단

    // 진행 중 필터 선택
    const activeFilterBtn = screen.getByRole('button', { name: '진행 중' });
    fireEvent.click(activeFilterBtn);

    expect(screen.getByText('장보기')).toBeInTheDocument();
    expect(screen.queryByText('책 읽기')).not.toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('할 일 검색');
    fireEvent.change(searchInput, { target: { value: '장' } });

    expect(screen.getByText('장보기')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '없는단어' } });
    expect(screen.getByText('일치하는 할 일이 없어요')).toBeInTheDocument();

    // 검색어 초기화 클릭
    const clearSearchBtn = screen.getByRole('button', { name: '검색어 초기화' });
    fireEvent.click(clearSearchBtn);

    expect(screen.getByText('장보기')).toBeInTheDocument();
  });

  it('완료 항목 일괄 삭제 다이얼로그를 통해 확인 후 삭제하거나 취소할 수 있다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    fireEvent.change(input, { target: { value: '완료할 일 1' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: '완료할 일 2' } });
    fireEvent.click(addButton);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const clearCompletedBtn = screen.getByRole('button', {
      name: '완료한 할 일 2개 일괄 삭제',
    });
    expect(clearCompletedBtn).not.toBeDisabled();

    // 일괄 삭제 클릭 -> 모달 오픈
    fireEvent.click(clearCompletedBtn);
    expect(screen.getByText('완료한 할 일을 삭제할까요?')).toBeInTheDocument();
    const dialogDesc = screen.getByText((_, element) => element?.id === 'confirm-dialog-desc');
    expect(dialogDesc.textContent).toContain('2개가 삭제됩니다');

    // 모달에서 취소 클릭 시 유지
    const cancelModalBtn = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelModalBtn);
    expect(screen.getByText('완료할 일 1')).toBeInTheDocument();
    expect(screen.getByText('완료할 일 2')).toBeInTheDocument();

    // 다시 열고 확인 삭제
    fireEvent.click(clearCompletedBtn);
    const confirmDeleteBtn = screen.getByRole('button', { name: '2개 삭제' });
    fireEvent.click(confirmDeleteBtn);

    expect(screen.queryByText('완료할 일 1')).not.toBeInTheDocument();
    expect(screen.queryByText('완료할 일 2')).not.toBeInTheDocument();
    expect(clearCompletedBtn).toBeDisabled();
  });

  it('localStorage에 저장되고 새로고침(재렌더링) 시 데이터가 복원된다', () => {
    const { unmount } = render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '영구 저장 테스트' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    // localStorage에 저장되었는지 확인
    const saved = localStorage.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.tasks[0].text).toBe('영구 저장 테스트');

    unmount();

    // 다시 마운트
    render(<App />);
    expect(screen.getByText('영구 저장 테스트')).toBeInTheDocument();
  });
});
