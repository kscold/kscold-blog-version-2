'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { HANSALIM_LECTURE, type LecturePlatform } from '../model/hansalimLecture';
import { GuideText } from './GuideText';
import { LectureFolderTree } from './LectureFolderTree';
import { LectureSectionHeading } from './LectureSectionHeading';

const PLATFORMS: { key: LecturePlatform; label: string }[] = [
  { key: 'windows', label: 'Windows' },
  { key: 'mac', label: 'Mac' },
];

/** 실습 자료를 받은 뒤 VS Code에서 폴더를 열기까지의 순서. Windows를 먼저 보여 주고 Mac은 골라서 본다. */
export function LectureSetupGuide() {
  const { steps, done, notes, tree } = HANSALIM_LECTURE.setup;
  const [platform, setPlatform] = useState<LecturePlatform>('windows');

  return (
    <section
      id="setup"
      data-testid="lecture-setup"
      className="scroll-mt-24"
      aria-labelledby="setup-title"
    >
      <LectureSectionHeading id="setup-title" title="실습 준비">
        압축을 풀고 VS Code에서 실습 폴더를 여는 순서입니다.
      </LectureSectionHeading>

      <PlatformTabs value={platform} onChange={setPlatform} />
      {PLATFORMS.map(item => (
        // 인쇄할 때는 두 운영체제 순서를 모두 보여 준다.
        <div
          key={item.key}
          role="tabpanel"
          id={`setup-panel-${item.key}`}
          aria-labelledby={`setup-tab-${item.key}`}
          data-testid={`lecture-setup-${item.key}`}
          hidden={platform !== item.key}
          // 안에 누를 것이 없으므로 탭 다음 Tab 키에서 본문으로 바로 들어오게 한다.
          tabIndex={0}
          className="mt-6 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface-900 print:!block"
        >
          <h3 className="mb-3 hidden font-bold print:block">{item.label}</h3>
          <ol className="space-y-4">
            {steps[item.key].map((text, index) => (
              <SetupStep key={text} order={index + 1} text={text} />
            ))}
          </ol>
        </div>
      ))}

      <p className="mt-6 break-keep text-base font-semibold leading-7 text-surface-900">{done}</p>
      <LectureFolderTree root={tree} />
      <ul className="mt-5 space-y-2 text-sm leading-6 text-surface-600">
        {notes.map(note => (
          <li key={note} className="break-keep">
            — <GuideText text={note} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 방향키·Home·End로 옮겨 다니는 탭 목록. 고른 탭만 Tab 순서에 들어간다. */
function PlatformTabs({
  value,
  onChange,
}: {
  value: LecturePlatform;
  onChange: (next: LecturePlatform) => void;
}) {
  const tabs = useRef<Partial<Record<LecturePlatform, HTMLButtonElement | null>>>({});

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = PLATFORMS.findIndex(item => item.key === value);
    const targets: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: PLATFORMS.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const next = PLATFORMS[(targets[event.key] + PLATFORMS.length) % PLATFORMS.length];
    onChange(next.key);
    tabs.current[next.key]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="쓰시는 컴퓨터"
      onKeyDown={onKeyDown}
      className="inline-flex rounded-full border border-surface-200 bg-white p-1 print:hidden"
    >
      {PLATFORMS.map(item => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            ref={node => {
              tabs.current[item.key] = node;
            }}
            type="button"
            role="tab"
            id={`setup-tab-${item.key}`}
            aria-selected={selected}
            aria-controls={`setup-panel-${item.key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            className={`min-h-11 min-w-[6.5rem] rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 ${
              selected ? 'bg-surface-900 text-white' : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SetupStep({ order, text }: { order: number; text: string }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-3">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-sm font-bold text-white"
        aria-hidden
      >
        {order}
      </span>
      <p className="break-keep pt-0.5 text-base leading-7 text-surface-700">
        <GuideText text={text} />
      </p>
    </li>
  );
}
