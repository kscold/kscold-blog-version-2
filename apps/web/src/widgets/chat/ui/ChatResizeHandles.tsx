import { useChatResize, type ResizeEdge } from '../model/useChatResize';

const handles: { edge: ResizeEdge; label: string; className: string; grip: string }[] = [
  {
    edge: 'top',
    label: '채팅 높이 조절',
    className: 'inset-x-10 -top-1 h-3 cursor-ns-resize',
    grip: 'left-1/2 top-1 h-1 w-10 -translate-x-1/2',
  },
  {
    edge: 'left',
    label: '채팅 너비 조절',
    className: 'inset-y-10 -left-1 w-3 cursor-ew-resize',
    grip: 'left-1 top-1/2 h-10 w-1 -translate-y-1/2',
  },
  { edge: 'corner', label: '채팅 너비와 높이 조절', className: 'left-0 top-0 h-8 w-8 cursor-nwse-resize rounded-tl-[24px]', grip: '' },
];

export function ChatResizeHandles({ resize }: { resize: ReturnType<typeof useChatResize> }) {
  if (resize.isMaximized) return null;
  return handles.map(({ edge, label, className, grip }) => (
    <button
      key={edge}
      type="button"
      aria-label={label}
      title={`${label}: 끌거나 화살표 키로 조절, Shift로 크게, Home 또는 두 번 클릭으로 기본 크기`}
      className={`group absolute z-20 hidden touch-none select-none text-surface-300 outline-hidden hover:text-surface-500 focus-visible:text-surface-700 sm:block ${className}`}
      onPointerDown={event => resize.onPointerDown(event, edge)}
      onPointerMove={resize.onPointerMove}
      onPointerUp={resize.onPointerEnd}
      onPointerCancel={resize.onPointerEnd}
      onLostPointerCapture={resize.onPointerEnd}
      onKeyDown={event => resize.onKeyDown(event, edge)}
      onDoubleClick={resize.reset}
    >
      {edge === 'corner' ? (
        <svg
          aria-hidden="true"
          className="absolute left-2 top-2 h-3.5 w-3.5 transition-transform group-hover:scale-110"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          <path d="M1.5 9.5l8-8M1.5 13l11.5-11.5" />
        </svg>
      ) : (
        <span
          aria-hidden="true"
          className={`absolute rounded-full bg-current opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 ${grip}`}
        />
      )}
    </button>
  ));
}
