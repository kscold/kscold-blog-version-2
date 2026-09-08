const SEOUL_TIME_ZONE = 'Asia/Seoul';
const OFFSETLESS_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/;

const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  calendar: 'gregory',
  numberingSystem: 'latn',
  timeZone: SEOUL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type DateValue = Date | string | null | undefined;

/** Spring LocalDateTime 응답은 오프셋이 없으므로 서비스 기준인 서울 시각으로 해석한다. */
function parseServiceDate(value: DateValue): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : new Date(value.getTime());
  }

  const trimmedValue = value.trim();
  const source = OFFSETLESS_DATE_TIME_PATTERN.test(trimmedValue)
    ? `${trimmedValue}+09:00`
    : trimmedValue;
  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function latestModifiedAt(...values: DateValue[]): string | undefined {
  let latest: Date | undefined;

  values.forEach(value => {
    const date = parseServiceDate(value);
    if (date && (!latest || date.getTime() > latest.getTime())) latest = date;
  });

  return latest?.toISOString();
}

export function toSitemapDate(value: DateValue): string | undefined {
  const date = parseServiceDate(value);
  if (!date) return undefined;

  const parts = Object.fromEntries(
    SEOUL_DATE_FORMATTER.formatToParts(date).map(part => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** 검색 메타데이터와 브라우저가 같은 순간을 해석하도록 시간대를 명시한다. */
export function toSeoDateTime(value: DateValue): string | undefined {
  return parseServiceDate(value)?.toISOString();
}

export function formatPublishedDate(value: DateValue): string {
  const date = parseServiceDate(value);
  return date
    ? new Intl.DateTimeFormat('ko-KR', {
        timeZone: SEOUL_TIME_ZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    : '';
}
