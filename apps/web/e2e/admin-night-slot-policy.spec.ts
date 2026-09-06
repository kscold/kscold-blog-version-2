import { expect, test } from '@playwright/test';
import {
  buildUpcomingAdminNightSlots,
  findAdminNightSlot,
} from '../src/widgets/admin-night/lib/adminNightSlots';
import { buildAdminNightPreferredSlot } from '../src/widgets/admin-night/lib/adminNightTime';

test.describe('Admin Night 슬롯 식별 정책', () => {
  test('사용자 지정 시간은 표시값에만 저장하고 슬롯 키는 날짜 단위로 유지한다', () => {
    const slot = buildUpcomingAdminNightSlots('2026-09-07', 1)[0];
    const preferredSlot = buildAdminNightPreferredSlot(slot, {
      startMinutes: 19 * 60,
      endMinutes: 22 * 60,
    });

    expect(preferredSlot.slotKey).toBe(slot.slotKey);
    expect(preferredSlot.timeLabel).toBe('19:00 - 22:00');
  });

  test('기존 시간 포함 키는 날짜와 포커스로 현재 슬롯에 연결한다', () => {
    const slots = buildUpcomingAdminNightSlots('2026-09-07', 2);
    const slot = slots[0];
    const legacyReference = {
      slotKey: `${slot.slotKey}|19:00-22:00`,
      date: slot.date,
      focus: slot.focus,
    };

    expect(findAdminNightSlot(slots, slot.slotKey)).toBe(slot);
    expect(findAdminNightSlot(slots, legacyReference)).toBe(slot);
    expect(findAdminNightSlot(slots, { ...legacyReference, date: '2026-09-08' })).toBeNull();
    expect(findAdminNightSlot(slots, { ...legacyReference, focus: '다른 일정' })).toBeNull();
    expect(
      findAdminNightSlot(slots, {
        slotKey: slots[1].slotKey,
        date: slots[0].date,
        focus: slots[0].focus,
      })
    ).toBe(slots[1]);
  });
});
