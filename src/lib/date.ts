/**
 * 현재 기기 날짜를 한국어 친화적인 형식으로 포맷팅합니다.
 * 예: 2026년 11월 26일 목요일
 */
export function getFormattedCurrentDate(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now);
}
