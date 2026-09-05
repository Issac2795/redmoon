/** year/month(1~12)/day로 'YYYY-MM-DD' 생성. day가 범위를 벗어나면(0 이하, 말일 초과 등) 자동으로 달을 넘겨 계산해줌 */
export function dateString(year: number, month: number, day: number): string {
  // UTC 변환(toISOString 등)을 거치면 시간대에 따라 하루가 밀릴 수 있어 로컬 컴포넌트만으로 계산한다.
  const date = new Date(year, month - 1, day);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** 'YYYY-MM-DD'에 days일을 더함(음수 가능) */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return dateString(year, month, day + days);
}
