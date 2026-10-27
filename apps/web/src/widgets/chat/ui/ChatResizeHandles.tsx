import { useChatResize, type ResizeEdge } from '../model/useChatResize';

const handles: { edge: ResizeEdge; label: string; className: string }[] = [
  { edge: 'top', label: '채팅 높이 조절', className: 'inset-x-6 top-0 h-2 cursor-ns-resize' },
  { edge: 'left', label: '채팅 너비 조절', className: 'inset-y-6 left-0 w-2 cursor-ew-resize' },
  { edge: 'corner', label: '채팅 너비와 높이 조절', className: 'left-1 top-1 h-5 w-5 cursor-nwse-resize rounded-tl-xl' },
];

export function ChatResizeHandles({ resize }: { resize: ReturnType<typeof useChatResize> }) {
  return handles.map(({ edge, label, className }) => (
    <button
      key={edge}
      type="button"
      aria-label={label}
      title={`${label}: 화살표 키, Shift로 크게 조절, Home 또는 두 번 클릭으로 복원`}
      className={`absolute z-10 hidden touch-none select-none text-surface-400 hover:bg-surface-200/60 focus-visible:bg-surface-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-surface-500 sm:block ${className}`}
      onPointerDown={event => resize.onPointerDown(event, edge)}
      onPointerMove={resize.onPointerMove}
      onPointerUp={resize.onPointerEnd}
      onPointerCancel={resize.onPointerEnd}
      onLostPointerCapture={resize.onPointerEnd}
      onKeyDown={event => resize.onKeyDown(event, edge)}
      onDoubleClick={resize.reset}
    >
      {edge === 'corner' && (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <path d="M3 10V3h7M6 10V6h4" />
        </svg>
      )}
    </button>
  ));
}
