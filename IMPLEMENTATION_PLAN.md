# 한국어 TodoList 웹앱 구현 계획서

## 1. 아키텍처 및 디렉터리 구조
- `index.html`: 메타 태그, 언어(`lang="ko"`), 뷰포트 설정
- `src/`
  - `types/todo.ts`: Task 데이터 모델, 스토리지 스키마, 필터/정렬 상태 타입
  - `styles/tokens.css`: DESIGN.md의 모든 CSS 변수 (색상, 여백, 반경, 타이포그래피 등)
  - `styles/global.css`: 리셋, 기본 포커스 스타일, 반응형 레이아웃 베이스
  - `lib/storage.ts`: localStorage 읽기/쓰기, 스키마 유효성 검증, 에러 핸들링
  - `lib/date.ts`: 로컬 날짜 포맷팅 유틸
  - `hooks/useTodos.ts`: 할 일 CRUD, 필터, 검색, 실행 취소(Undo), 일괄 삭제 상태 및 비즈니스 로직
  - `components/`
    - `Header.tsx`: 앱 헤더, 날짜 표시, 통계 및 접근 가능한 진행률 막대
    - `TodoInput.tsx`: 새 할 일 입력 폼 (200자 제한, 한글 IME 처리, 에러 메시지)
    - `FilterSearch.tsx`: 상태 필터(전체/진행 중/완료) 및 검색바(초기화 버튼 포함)
    - `TodoList.tsx`: 할 일 목록 렌더링, 빈 상태 처리
    - `TodoItem.tsx`: 개별 할 일 아이템 (완료 토글, 인라인 수정, 삭제, 키보드 조작)
    - `Footer.tsx`: 남은 할 일 수 표시, 완료 항목 일괄 삭제 트리거, 브라우저 저장 상태 안내
    - `ConfirmDialog.tsx`: 완료 항목 일괄 삭제 확인용 접근성 모달 다이얼로그
    - `UndoToast.tsx`: 개별 삭제 시 하단 실행 취소 알림 바
    - `AlertBanner.tsx`: 저장 실패 / 스키마 오류 / 필터로 인한 숨김 알림 배너
  - `App.tsx`: 최상위 레이아웃 및 컴포넌트 조합
  - `main.tsx`: React 마운트 엔트리포인트

## 2. 데이터 모델 및 스토리지 명세
```typescript
export interface Task {
  id: string; // crypto.randomUUID()
  text: string; // 1~200자
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface StorageData {
  schemaVersion: 1;
  tasks: Task[];
}
```
- 스토리지 키: `todo-app:v1`
- 정렬 기준: `createdAt` 내림차순 유지 (완료 전환이나 수정 시 순서 변경 없음)
- 실행 취소: 삭제된 항목의 `originalIndex`와 `task` 객체를 보관하여 원래 위치로 정확히 복원

## 3. 핵심 인터랙션 및 접근성 설계
- 한글 IME: `onCompositionStart`, `onCompositionEnd`, `e.nativeEvent.isComposing` 확인 후 `Enter` 처리
- 포커스 관리:
  - 할 일 등록 후 입력창 포커스 유지
  - 항목 삭제 시 인접 항목의 삭제 버튼으로 포커스 이동 (없으면 입력창)
  - 인라인 수정 시작 시 수정 입력창 포커스, 완료/취소 시 수정 버튼으로 복귀
  - 일괄 삭제 다이얼로그 오픈 시 '취소' 버튼에 초기 포커스, 닫힐 때 원래 트리거 버튼으로 복귀
- 터치 및 가독성: 44px 이상 터치 영역, 4.5:1 이상 명도 대비 기준 충족

## 4. 검증 계획
1. Vitest + RTL 기반 단위/통합 테스트 (CRUD, IME, 로컬스토리지 복원, 예외 처리)
2. Vite 빌드 및 TypeScript 정적 타입 검사 (`npm run build`)
3. 내장 브라우저/Playwright를 통한 360px 모바일, 768px 태블릿, 1440px 데스크톱 반응형 및 시각적 검증
