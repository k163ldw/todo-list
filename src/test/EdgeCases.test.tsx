import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import * as storage from '../lib/storage';

describe('TodoList 엣지 케이스 및 데이터 보호 검증', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('200자 제한: 200자까지만 입력받고 초과 입력을 방지한다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const longText = '가'.repeat(250);

    fireEvent.change(input, { target: { value: longText } });

    // maxLength="200" 속성에 의해 브라우저에서 잘리거나 onChange에서 200자 이내만 허용
    expect(input).toHaveValue('가'.repeat(200));
    expect(screen.getByText('200/200')).toBeInTheDocument();
  });

  it('수정 시 공백만 있는 문자열로 저장하려 하면 차단되고 오류 메시지가 표시된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '기존 항목' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    const editBtn = screen.getByRole('button', { name: /내용 수정/ });
    fireEvent.click(editBtn);

    const editInput = screen.getByDisplayValue('기존 항목');
    fireEvent.change(editInput, { target: { value: '    ' } });

    fireEvent.click(screen.getByRole('button', { name: /수정 저장/ }));

    expect(screen.getByText('할 일을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.queryByText('기존 항목')).not.toBeInTheDocument(); // 아직 수정 모드 중
  });

  it('완료 필터가 적용된 상태에서 새 할 일을 추가하면 숨김 안내 배너와 전체 보기 버튼이 제공된다', () => {
    render(<App />);

    // 1. '완료' 필터 활성화
    const completedFilterBtn = screen.getByRole('button', { name: '완료' });
    fireEvent.click(completedFilterBtn);

    // 2. 새 할 일 등록 (새 할 일은 미완료 상태이므로 '완료' 필터에서 숨겨짐)
    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '새로 추가한 미완료 할 일' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    // 안내 배너 확인
    expect(
      screen.getByText('할 일을 추가했어요. 현재 필터/검색 조건에서는 보이지 않습니다.')
    ).toBeInTheDocument();

    // 전체 보기 버튼 클릭 시 필터가 전체로 리셋되고 목록에 표시됨
    const viewAllBtn = screen.getAllByRole('button', { name: '전체 보기' })[0];
    fireEvent.click(viewAllBtn);

    expect(screen.getByText('새로 추가한 미완료 할 일')).toBeInTheDocument();
  });

  it('연속 삭제 시 최신 삭제 1건만 실행 취소 대상이 된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    fireEvent.change(input, { target: { value: '항목 1' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: '항목 2' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: '항목 3' } });
    fireEvent.click(addButton);

    // 목록은 항목 3, 항목 2, 항목 1 순
    // 1. 항목 3 삭제
    const delBtn3 = screen.getByRole('button', { name: '할 일 "항목 3" 삭제' });
    fireEvent.click(delBtn3);

    // 2. 항목 2 삭제 (연속 삭제)
    const delBtn2 = screen.getByRole('button', { name: '할 일 "항목 2" 삭제' });
    fireEvent.click(delBtn2);

    // 이제 최신 삭제 대상은 '항목 2'
    const undoButton = screen.getByRole('button', { name: '삭제한 할 일 복원하기' });
    fireEvent.click(undoButton);

    // '항목 2'는 복원되었고, '항목 3'은 복원되지 않음
    expect(screen.getByText('항목 2')).toBeInTheDocument();
    expect(screen.queryByText('항목 3')).not.toBeInTheDocument();
    expect(screen.getByText('항목 1')).toBeInTheDocument();
  });

  it('localStorage 저장 실패(QuotaExceeded 등) 시 UI에 경고를 표시하고 메모리 상태를 안전하게 유지한다', () => {
    // saveTasksToStorage가 실패하도록 모의
    const saveSpy = vi.spyOn(storage, 'saveTasksToStorage').mockReturnValue(false);

    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '저장 실패 시 메모리 유지 테스트' } });
    fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));

    // 메모리 상에서 목록에는 여전히 존재
    expect(screen.getByText('저장 실패 시 메모리 유지 테스트')).toBeInTheDocument();

    // 저장 실패 경고 메시지 표시 확인
    expect(
      screen.getByText('변경 내용을 이 브라우저에 저장하지 못했어요. 창을 닫으면 사라질 수 있습니다.')
    ).toBeInTheDocument();

    saveSpy.mockRestore();
  });
});
