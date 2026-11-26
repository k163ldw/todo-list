# TodoList 프로젝트 구현 및 QA 가이드 스킬

본 문서는 한국어 TodoList 웹앱의 개발, 테스트 및 QA 검증 표준 절차를 정의하는 프로젝트 스킬 가이드입니다.

## 1. 역할 정의
- **프론트엔드 엔지니어**: React, TypeScript, CSS Custom Properties를 이용한 무결점 컴포넌트 아키텍처 및 상태 관리.
- **프로덕트 디자이너**: DESIGN.md 토큰 및 반응형(360px ~ 1440px), 타이포그래피, 가독성, 피드백 애니메이션 준수.
- **QA 엔지니어**: Vitest 단위/통합 테스트, 한글 IME 조합 처리, 키보드 접근성(A11y), localStorage 장애 시나리오 검증.

## 2. 핵심 점검 체크리스트
1. **한글 IME 처리**:
   - `e.nativeEvent.isComposing` 상태를 확인하여 한글 입력 완료 전 Enter 시 중복 전송 방지.
2. **접근성(A11y)**:
   - 모든 대화형 요소(버튼, 입력)는 44px 이상의 터치 타깃을 확보.
   - 키보드 포커스 링(`--color-focus`, 2px solid, outline-offset: 3px) 유지.
   - 대화상자(Dialog) 포커스 트랩 및 Esc 키 닫기, 포커스 복귀.
   - `aria-live` 및 `role="status"`를 통한 알림 전달.
3. **데이터 무결성 및 복원력**:
   - 스키마 버전(`schemaVersion: 1`) 관리 및 파싱 실패 시 원본 데이터 보존.
   - 저장 실패(QuotaExceeded 등) 시 UI 경고 노출 및 메모리 상 작업 유지.
   - 단일 항목 삭제 후 원래 위치와 속성을 완벽히 복원하는 실행 취소(Undo) 메커니즘.

## 3. 검증 명령어 표준
- 개발 서버 실행: `npm run dev`
- 테스트 실행: `npm run test`
- 빌드 및 타입 검사: `npm run build`
