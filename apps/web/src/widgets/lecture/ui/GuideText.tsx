import { Fragment } from 'react';

// 이 길이를 넘는 조각은 메뉴 이름이 아니라 설명 문장으로 보고 줄바꿈을 허용한다.
const MENU_NAME_MAX = 16;

/**
 * 안내 문장에서 「」로 감싼 메뉴·파일 이름을 괄호 없이 굵게 보여 준다.
 * 「파일 › 폴더 열기」처럼 › 로 이은 메뉴는 차례를 따라 읽히도록 MenuPath로 그린다.
 */
export function GuideText({ text }: { text: string }) {
  // 괄호 하나로 묶은 정규식으로 나누면 홀수 번째 조각이 「」 안의 이름이다.
  const parts = text.split(/「([^」]+)」/);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 0 ? (
          <Fragment key={`${index}-${part}`}>{part}</Fragment>
        ) : (
          <MenuPath key={`${index}-${part}`} text={part} />
        )
      )}
    </>
  );
}

/**
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
            className={`font-semibold text-surface-900 ${part.length <= MENU_NAME_MAX ? 'whitespace-nowrap' : ''}`}
          >
            {part}
          </span>
        </Fragment>
      ))}
    </>
  );
}
