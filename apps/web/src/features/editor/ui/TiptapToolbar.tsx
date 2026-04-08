import type { ToolbarButtonConfig } from '@/features/editor/model/tiptapToolbar';

export function TiptapToolbar({
  buttons,
  dataCy,
}: {
  buttons: ToolbarButtonConfig[];
  dataCy: string;
}) {
  return (
    <div
      data-cy={dataCy}
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {buttons.map(button => (
        <ToolbarButton key={button.title} {...button} />
      ))}
    </div>
  );
}

function ToolbarButton({
  label,
  title,
  active = false,
  onClick,
  tone = 'default',
}: ToolbarButtonConfig) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={event => {
        event.preventDefault();
        onClick();
      }}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        tone === 'accent'
          ? active
            ? 'bg-surface-900 text-white'
            : 'border border-surface-900 bg-surface-900 text-white hover:bg-surface-800'
          : active
            ? 'bg-surface-900 text-white'
            : 'border border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:text-surface-900'
      }`}
    >
      {label}
    </button>
  );
}
