import { expect, test } from '@playwright/test';
import {
  addAdminNightDays,
  getAdminNightDateKey,
  millisecondsUntilNextAdminNightDay,
} from '../src/widgets/admin-night/lib/adminNightDate';
import {
  buildAdminNightSlots,
  buildUpcomingAdminNightSlots,
} from '../src/widgets/admin-night/lib/adminNightSlots';

test.describe('Admin Night 서울 날짜 정책', () => {
  test('같은 순간을 서울 자정 경계에 맞춰 날짜 키로 바꾼다', () => {
    expect(getAdminNightDateKey(new Date('2026-09-06T14:59:59.999Z'))).toBe('2026-09-06');
    expect(getAdminNightDateKey(new Date('2026-09-06T15:00:00.000Z'))).toBe('2026-09-07');
    expect(millisecondsUntilNextAdminNightDay(new Date('2026-09-06T14:59:59.500Z'))).toBe(500);
  });

  test('월요일부터 일요일까지 한 주를 동일한 날짜 키에서 만든다', () => {
    const sundayWeek = buildAdminNightSlots('2026-09-06');
    const mondayWeek = buildAdminNightSlots('2026-09-07');

    expect(sundayWeek.map(slot => slot.date)).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
    ]);
    expect(sundayWeek.at(-1)?.state).toBe('tonight');
    expect(mondayWeek[0]).toMatchObject({ date: '2026-09-07', state: 'tonight' });
    expect(mondayWeek.at(-1)?.date).toBe('2026-09-13');
  });

  test('월·연·윤년 경계를 런타임 타임존과 무관하게 이동한다', () => {
    expect(addAdminNightDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addAdminNightDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addAdminNightDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(buildUpcomingAdminNightSlots('2026-12-31', 3).map(slot => slot.date)).toEqual([
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  test('잘못된 날짜 키와 조회 일수는 조용히 보정하지 않는다', () => {
    expect(() => addAdminNightDays('2026-02-29', 1)).toThrow(RangeError);
    expect(() => buildUpcomingAdminNightSlots('2026-09-06', -1)).toThrow(RangeError);
    expect(() => getAdminNightDateKey(new Date('invalid'))).toThrow(RangeError);
  });
});
