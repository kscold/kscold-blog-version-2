import { Fragment } from 'react';
import { HANSALIM_LECTURE, type LectureSetupStep } from '../model/hansalimLecture';

const PLATFORMS = [
  { key: 'windows', label: 'Windows' },
  { key: 'mac', label: 'Mac' },
] as const;

/** 실습 자료를 받은 뒤 VS Code에서 폴더를 열기까지의 순서를 Windows·Mac으로 나눠 보여 준다. */
export function LectureSetupGuide() {
  const { steps, notes } = HANSALIM_LECTURE.setup;

  return (
    <section
      id="setup"
      data-testid="lecture-setup"
      className="scroll-mt-6 border-t border-surface-200 p-6 sm:p-10 lg:p-12"
      aria-labelledby="setup-title"
    >
      <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
        Setup
      </p>
      <h2 id="setup-title" className="break-keep text-2xl font-black tracking-tight sm:text-3xl">
        실습 준비
      </h2>
      <p className="mt-3 break-keep text-sm leading-6 text-surface-500">
        압축을 풀고 VS Code에서 폴더를 여는 순서입니다. 쓰시는 컴퓨터에 맞는 쪽만 따라 하세요.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLATFORMS.map(platform => (
          <SetupPlatformCard key={platform.key} platform={platform} steps={steps} />
        ))}
      </div>

      <ul className="mt-6 space-y-2 rounded-2xl bg-surface-50 p-5 text-sm leading-6 text-surface-600 ring-1 ring-inset ring-surface-200">
        {notes.map(note => (
          <li key={note} className="break-keep">
            — {note}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SetupPlatformCard({
  platform,
  steps,
}: {
  platform: (typeof PLATFORMS)[number];
  steps: LectureSetupStep[];
}) {
  return (
    <article
      data-testid={`lecture-setup-${platform.key}`}
      className="min-w-0 rounded-2xl border border-surface-200 bg-white p-5 sm:p-6"
      aria-label={`${platform.label} 실습 준비`}
    >
      <h3 className="text-lg font-black tracking-tight">{platform.label}</h3>
      <ol className="mt-5 space-y-5">
        {steps.map((step, index) => (
          <SetupStep
            key={step.title}
            step={step}
            order={index + 1}
            instruction={step[platform.key]}
          />
        ))}
      </ol>
    </article>
  );
}

function SetupStep({
  step,
  order,
  instruction,
}: {
  step: LectureSetupStep;
  order: number;
  instruction: string;
}) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-3">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${
          step.optional ? 'bg-surface-100 text-surface-500' : 'bg-surface-900 text-white'
        }`}
        aria-hidden
      >
        {order}
      </span>
      <div>
        <p className="flex flex-wrap items-center gap-2 font-bold text-surface-900">
          {step.title}
          {step.optional && (
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-bold text-surface-500">
              선택
            </span>
          )}
        </p>
        <p className="mt-1 break-keep text-sm leading-6 text-surface-600">
          <MenuPath text={instruction} />
        </p>
        {step.link && (
          <a
            href={step.link.href}
            className="mt-1 inline-block text-sm font-bold text-primary-700 underline underline-offset-4"
          >
            {step.link.label}
          </a>
        )}
      </div>
    </li>
  );
}

// 이 길이를 넘는 조각은 메뉴 이름이 아니라 설명 문장으로 보고 줄바꿈을 허용한다.
const MENU_NAME_MAX = 16;

/**
 * 「파일 › 폴더 열기」처럼 메뉴를 따라가는 순서는 구분 기호를 흐리게 보여 눌러야 할 이름이 먼저 읽히게 한다.
 * 짧은 메뉴 이름은 한 덩어리로 두고 구분 기호에서만 줄을 바꿔, 휴대폰에서도 「모두 압축 풀기」가 둘로 갈라지지 않게 한다.
 * 문장처럼 긴 조각은 묶으면 좁은 화면을 넘치므로 평소처럼 줄을 바꾼다.
 */
function MenuPath({ text }: { text: string }) {
  const parts = text.split(' › ');
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {/* 구분 기호 앞뒤의 공백이 줄을 바꿀 자리다. 없으면 묶인 메뉴 이름 전체가 한 줄로 이어져 좁은 화면을 넘친다. */}
          {index > 0 && (
            <>
              {' '}
              <span className="text-surface-300" aria-hidden>
                ›
              </span>
              <span className="sr-only">, 다음</span>{' '}
            </>
          )}
          <span
            data-menu-part
            className={
              parts.length > 1
                ? `font-semibold text-surface-800 ${part.length <= MENU_NAME_MAX ? 'whitespace-nowrap' : ''}`
                : ''
            }
          >
            {part}
          </span>
        </Fragment>
      ))}
    </>
  );
}
