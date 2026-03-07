'use client';

import type { OnMount } from '@monaco-editor/react';

type IStandaloneCodeEditor = Parameters<OnMount>[0];

interface MarkdownToolbarProps {
  editorRef: React.MutableRefObject<IStandaloneCodeEditor | null>;
}

type FormatAction = {
  label: string;
  title: string;
  prefix?: string;
  suffix?: string;
  linePrefix?: string;
  block?: string;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { label: 'H1', title: '제목 1', linePrefix: '# ' },
  { label: 'H2', title: '제목 2', linePrefix: '## ' },
  { label: 'H3', title: '제목 3', linePrefix: '### ' },
];

const INLINE_ACTIONS: FormatAction[] = [
  { label: 'B', title: '굵게', prefix: '**', suffix: '**' },
  { label: 'I', title: '기울임', prefix: '*', suffix: '*' },
  { label: 'S', title: '취소선', prefix: '~~', suffix: '~~' },
  { label: '`', title: '인라인 코드', prefix: '`', suffix: '`' },
  { label: '<>', title: '링크', prefix: '[', suffix: '](url)' },
  { label: '![]', title: '이미지', prefix: '![alt](', suffix: ')' },
];

const BLOCK_ACTIONS: FormatAction[] = [
  { label: '"""', title: '인용문', linePrefix: '> ' },
  { label: '```', title: '코드 블록', block: '```\n\n```' },
  { label: '---', title: '구분선', block: '\n---\n' },
  { label: '•', title: '순서 없는 목록', linePrefix: '- ' },
  { label: '1.', title: '순서 있는 목록', linePrefix: '1. ' },
];

export function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
  const applyFormat = (action: FormatAction) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const model = editor.getModel();
    if (!model) return;

    const selectedText = model.getValueInRange(selection);

    if (action.block !== undefined) {
      const insertText = selectedText
        ? action.block.replace('\n\n', `\n${selectedText}\n`)
        : action.block;
      editor.executeEdits('toolbar', [
        {
          range: selection,
          text: insertText,
        },
      ]);
      editor.focus();
      return;
    }

    if (action.linePrefix !== undefined) {
      const linePrefix = action.linePrefix;
      if (selection.startLineNumber === selection.endLineNumber) {
        const line = model.getLineContent(selection.startLineNumber);
        const alreadyHasPrefix = line.startsWith(linePrefix);
        const newLine = alreadyHasPrefix ? line.slice(linePrefix.length) : linePrefix + line;
        editor.executeEdits('toolbar', [
          {
            range: {
              startLineNumber: selection.startLineNumber,
              startColumn: 1,
              endLineNumber: selection.startLineNumber,
              endColumn: line.length + 1,
            },
            text: newLine,
          },
        ]);
      } else {
        const edits = [];
        for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
          const line = model.getLineContent(i);
          const alreadyHasPrefix = line.startsWith(linePrefix);
          edits.push({
            range: {
              startLineNumber: i,
              startColumn: 1,
              endLineNumber: i,
              endColumn: line.length + 1,
            },
            text: alreadyHasPrefix ? line.slice(linePrefix.length) : linePrefix + line,
          });
        }
        editor.executeEdits('toolbar', edits);
      }
      editor.focus();
      return;
    }

    if (action.prefix !== undefined && action.suffix !== undefined) {
      const prefix = action.prefix;
      const suffix = action.suffix;
      const newText = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}텍스트${suffix}`;
      editor.executeEdits('toolbar', [
        {
          range: selection,
          text: newText,
        },
      ]);
      editor.focus();
    }
  };

  const buttonClass =
    'px-2 py-1 text-xs font-mono rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-500';

  const separatorClass = 'w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1';

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-t-lg border-b-0">
      {FORMAT_ACTIONS.map(action => (
        <button
          key={action.label}
          type="button"
          title={action.title}
          onClick={() => applyFormat(action)}
          className={buttonClass}
        >
          {action.label}
        </button>
      ))}

      <div className={separatorClass} />

      {INLINE_ACTIONS.map(action => (
        <button
          key={action.label}
          type="button"
          title={action.title}
          onClick={() => applyFormat(action)}
          className={buttonClass}
        >
          {action.label}
        </button>
      ))}

      <div className={separatorClass} />

      {BLOCK_ACTIONS.map(action => (
        <button
          key={action.label}
          type="button"
          title={action.title}
          onClick={() => applyFormat(action)}
          className={buttonClass}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
