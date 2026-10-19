import type { FolderTreeItem } from '../model/hansalimLecture';

// 가지 선이 글자 한가운데에 닿는 높이(줄 높이 24px의 절반 + 위 여백 2px).
const BRANCH_LINE =
  'relative py-0.5 pl-5 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-surface-300 last:before:h-[14px] after:absolute after:left-0 after:top-[14px] after:h-px after:w-3 after:bg-surface-300';

/**
 * 압축을 푼 실습 폴더의 주요 항목. 한글과 영문의 글자 폭이 달라도 줄이 어긋나지 않도록
 * 문자 그림(├─) 대신 들여쓴 목록에 CSS로 가지 선을 긋는다.
 */
export function LectureFolderTree({ root }: { root: FolderTreeItem }) {
  return (
    <figure
      data-testid="lecture-folder-tree"
      className="mt-5 rounded-2xl bg-surface-50 px-5 py-4 text-sm leading-6"
    >
      <figcaption className="mb-2 text-xs text-surface-500">
        압축을 풀면 보이는 폴더 (주요 항목만)
      </figcaption>
      <p className="font-bold text-surface-900">{root.name}</p>
      {root.children && <TreeList items={root.children} />}
    </figure>
  );
}

function TreeList({ items }: { items: FolderTreeItem[] }) {
  return (
    <ul className="ml-1.5">
      {items.map(item => (
        <li key={item.name} className={BRANCH_LINE}>
          <span className={item.folder ? 'font-semibold text-surface-900' : 'text-surface-700'}>
            {item.name}
          </span>
          {item.note && (
            <span className="ml-2 break-keep text-surface-500">
              <span aria-hidden>← </span>
              {item.note}
            </span>
          )}
          {item.children && <TreeList items={item.children} />}
        </li>
      ))}
    </ul>
  );
}
