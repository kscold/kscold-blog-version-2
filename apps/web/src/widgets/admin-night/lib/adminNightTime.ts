import type { AdminNightSlot } from './adminNightSlots';

export const ADMIN_NIGHT_REQUEST_START_MINUTES = 19 * 60;
export const ADMIN_NIGHT_REQUEST_END_MINUTES = 23 * 60;
export const ADMIN_NIGHT_REQUEST_STEP_MINUTES = 10;
export const ADMIN_NIGHT_REQUEST_MIN_DURATION = 60;

export interface AdminNightTimeRange {
  startMinutes: number;
  endMinutes: number;
}

function clampToRequestWindow(minutes: number) {
  return Math.min(
    ADMIN_NIGHT_REQUEST_END_MINUTES,
    Math.max(ADMIN_NIGHT_REQUEST_START_MINUTES, minutes)
  );
}

function roundToStep(minutes: number) {
  return Math.round(minutes / ADMIN_NIGHT_REQUEST_STEP_MINUTES) * ADMIN_NIGHT_REQUEST_STEP_MINUTES;
}

export function formatAdminNightTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${mins}`.padStart(2, '0')}`;
}

export function formatAdminNightTimeRange(startMinutes: number, endMinutes: number) {
  return `${formatAdminNightTime(startMinutes)} - ${formatAdminNightTime(endMinutes)}`;
}

export function clampAdminNightTimeRange(range: AdminNightTimeRange): AdminNightTimeRange {
  const fixedStart = ADMIN_NIGHT_REQUEST_START_MINUTES;
  const clampedEnd = roundToStep(clampToRequestWindow(range.endMinutes));

  if (clampedEnd - fixedStart < ADMIN_NIGHT_REQUEST_MIN_DURATION) {
    return {
      startMinutes: fixedStart,
      endMinutes: fixedStart + ADMIN_NIGHT_REQUEST_MIN_DURATION,
    };
  }

  return {
    startMinutes: fixedStart,
    endMinutes: clampedEnd,
  };
}

export function parseAdminNightTimeRange(timeLabel: string | null | undefined, fallback?: AdminNightTimeRange) {
  const matched = timeLabel?.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!matched) {
    return fallback ?? {
      startMinutes: ADMIN_NIGHT_REQUEST_START_MINUTES,
      endMinutes: 21 * 60,
    };
  }

  const [, startHour, startMinute, endHour, endMinute] = matched;
  return clampAdminNightTimeRange({
    startMinutes: Number(startHour) * 60 + Number(startMinute),
    endMinutes: Number(endHour) * 60 + Number(endMinute),
  });
}

export function buildAdminNightPreferredSlot(slot: AdminNightSlot, range: AdminNightTimeRange) {
  const normalizedRange = clampAdminNightTimeRange(range);
  const timeLabel = formatAdminNightTimeRange(
    normalizedRange.startMinutes,
    normalizedRange.endMinutes
  );

  return {
    slotKey: `${slot.date}|${slot.focus}|${formatAdminNightTime(normalizedRange.startMinutes)}-${formatAdminNightTime(normalizedRange.endMinutes)}`,
    date: slot.date,
    weekday: slot.weekday,
    timeLabel,
    focus: slot.focus,
    badgeLabel: slot.badgeLabel,
  };
}
