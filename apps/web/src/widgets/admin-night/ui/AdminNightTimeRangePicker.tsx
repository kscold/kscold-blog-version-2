'use client';

import type { ChangeEvent, FormEvent } from 'react';
import {
  ADMIN_NIGHT_REQUEST_END_MINUTES,
  ADMIN_NIGHT_REQUEST_MIN_DURATION,
  ADMIN_NIGHT_REQUEST_START_MINUTES,
  ADMIN_NIGHT_REQUEST_STEP_MINUTES,
  clampAdminNightTimeRange,
  formatAdminNightTime,
  formatAdminNightTimeRange,
} from '@/widgets/admin-night/lib/adminNightTime';

interface AdminNightTimeRangePickerProps {
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
}

export function AdminNightTimeRangePicker({
  startMinutes,
  endMinutes,
  onChange,
}: AdminNightTimeRangePickerProps) {
  const totalWindow = ADMIN_NIGHT_REQUEST_END_MINUTES - ADMIN_NIGHT_REQUEST_START_MINUTES;
  const startPercent = ((startMinutes - ADMIN_NIGHT_REQUEST_START_MINUTES) / totalWindow) * 100;
  const endPercent = ((endMinutes - ADMIN_NIGHT_REQUEST_START_MINUTES) / totalWindow) * 100;

  const handleStartChange = (value: number) => {
    onChange(
      clampAdminNightTimeRange({
        startMinutes: value,
        endMinutes,
      })
    );
  };

  const handleEndChange = (value: number) => {
    onChange(
      clampAdminNightTimeRange({
        startMinutes,
        endMinutes: value,
      })
    );
  };

  const handleStartInput = (
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) => {
    handleStartChange(Number(event.currentTarget.value));
  };

  const handleEndInput = (
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) => {
    handleEndChange(Number(event.currentTarget.value));
  };

  return (
    <div className="rounded-[24px] border border-surface-200 bg-surface-50 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold text-surface-900">같이 붙고 싶은 시간</p>
          <p className="text-xs leading-6 text-surface-500">
            19:00부터 23:00 사이를 드래그해서 정해 주세요. 최소 30분 이상 선택할 수 있습니다.
          </p>
        </div>
        <span
          data-cy="admin-night-range-summary"
          className="inline-flex items-center rounded-full border border-surface-200 bg-white px-3 py-1.5 text-sm font-bold text-surface-900"
        >
          {formatAdminNightTimeRange(startMinutes, endMinutes)}
        </span>
      </div>

      <div className="mt-5">
        <div className="relative h-10">
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface-200" />
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface-900"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          <input
            type="range"
            min={ADMIN_NIGHT_REQUEST_START_MINUTES}
            max={ADMIN_NIGHT_REQUEST_END_MINUTES - ADMIN_NIGHT_REQUEST_MIN_DURATION}
            step={ADMIN_NIGHT_REQUEST_STEP_MINUTES}
            value={startMinutes}
            data-cy="admin-night-range-start"
            onInput={handleStartInput}
            onChange={handleStartInput}
            className="admin-night-range-slider"
          />

          <input
            type="range"
            min={ADMIN_NIGHT_REQUEST_START_MINUTES + ADMIN_NIGHT_REQUEST_MIN_DURATION}
            max={ADMIN_NIGHT_REQUEST_END_MINUTES}
            step={ADMIN_NIGHT_REQUEST_STEP_MINUTES}
            value={endMinutes}
            data-cy="admin-night-range-end"
            onInput={handleEndInput}
            onChange={handleEndInput}
            className="admin-night-range-slider"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-surface-300">
          {[
            ADMIN_NIGHT_REQUEST_START_MINUTES,
            ADMIN_NIGHT_REQUEST_START_MINUTES + 60,
            ADMIN_NIGHT_REQUEST_START_MINUTES + 120,
            ADMIN_NIGHT_REQUEST_START_MINUTES + 180,
            ADMIN_NIGHT_REQUEST_END_MINUTES,
          ].map(minutes => (
            <span key={minutes}>{formatAdminNightTime(minutes)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
