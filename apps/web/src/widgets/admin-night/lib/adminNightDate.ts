const SEOUL_TIME_ZONE = 'Asia/Seoul';
const SEOUL_UTC_OFFSET_MS = 9 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  calendar: 'gregory',
  numberingSystem: 'latn',
  timeZone: SEOUL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 같은 순간을 어느 실행 환경에서 계산해도 동일한 서울 날짜 키로 바꾼다. */
export function getAdminNightDateKey(instant: Date) {
  if (!Number.isFinite(instant.getTime())) {
    throw new RangeError('Admin Night 기준 시각이 올바르지 않습니다.');
  }

  const parts = Object.fromEntries(
    SEOUL_DATE_FORMATTER.formatToParts(instant).map(part => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addAdminNightDays(dateKey: string, days: number) {
  if (!Number.isSafeInteger(days)) {
    throw new RangeError('Admin Night 날짜 이동 값은 정수여야 합니다.');
  }

  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDateKey(date);
}

export function getAdminNightWeekdayIndex(dateKey: string) {
  return parseDateKey(dateKey).getUTCDay();
}

export function formatAdminNightDateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getUTCMonth() + 1}. ${date.getUTCDate()}.`;
}

export function formatAdminNightWeekday(dateKey: string) {
  return WEEKDAY_LABELS[getAdminNightWeekdayIndex(dateKey)];
}

/** 서울 자정 직후 날짜 상태를 다시 맞추기 위해 남은 밀리초를 계산한다. */
export function millisecondsUntilNextAdminNightDay(instant: Date) {
  const today = parseDateKey(getAdminNightDateKey(instant));
  today.setUTCDate(today.getUTCDate() + 1);
  const nextSeoulMidnight = today.getTime() - SEOUL_UTC_OFFSET_MS;
  return Math.max(1, nextSeoulMidnight - instant.getTime());
}

function parseDateKey(dateKey: string) {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) {
    throw new RangeError('Admin Night 날짜 키 형식이 올바르지 않습니다.');
  }

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (formatUtcDateKey(date) !== dateKey) {
    throw new RangeError('Admin Night 날짜 키가 실제 날짜가 아닙니다.');
  }
  return date;
}

function formatUtcDateKey(date: Date) {
  const year = `${date.getUTCFullYear()}`.padStart(4, '0');
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
