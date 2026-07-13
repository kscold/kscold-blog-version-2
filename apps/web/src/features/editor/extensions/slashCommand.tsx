'use client';

import { Extension, ReactRenderer, type Editor, type Range } from '@tiptap/react';
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from '@tiptap/suggestion';
import {
  filterCommands,
  type CommandItem,
  type SlashCommandActions,
} from '@/features/editor/extensions/slashCommandItems';
import {
  SlashCommandList,
  type SlashMenuHandle,
  type SlashMenuProps,
} from '@/features/editor/ui/SlashCommandList';

export type { SlashCommandActions } from '@/features/editor/extensions/slashCommandItems';

/* ─────────────── Suggestion 연결 ─────────────── */

function positionMenu(element: HTMLElement, clientRect: DOMRect | null) {
  if (!clientRect) return;
  const menuHeight = Math.min(element.offsetHeight || 320, 320);
  const below = clientRect.bottom + 8;
  const flip = below + menuHeight > window.innerHeight && clientRect.top - menuHeight - 8 > 0;
  element.style.position = 'fixed';
  element.style.zIndex = '60';
  element.style.left = `${Math.min(clientRect.left, window.innerWidth - 300)}px`;
  element.style.top = flip ? `${clientRect.top - menuHeight - 8}px` : `${below}px`;
}

export const SlashCommand = Extension.create<SlashCommandActions>({
  name: 'slashCommand',

  addOptions() {
    return {};
  },

  addProseMirrorPlugins() {
    const actions = this.options;

    return [
      Suggestion<CommandItem>({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        allow: ({ state }) => {
          const { $from } = state.selection;
          return $from.parent.type.name !== 'codeBlock';
        },
        items: ({ query }) => filterCommands(query),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range as Range).run();
          props.run(editor as Editor, actions);
        },
        render: () => {
          let component: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;

          return {
            onStart: (props: SuggestionProps<CommandItem>) => {
              component = new ReactRenderer(SlashCommandList, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              });
              document.body.appendChild(component.element);
              positionMenu(component.element as HTMLElement, props.clientRect?.() ?? null);
            },
            onUpdate: (props: SuggestionProps<CommandItem>) => {
              component?.updateProps({ items: props.items, command: props.command });
              if (component) {
                positionMenu(component.element as HTMLElement, props.clientRect?.() ?? null);
              }
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === 'Escape') {
                component?.destroy();
                component?.element.remove();
                component = null;
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              component?.element.remove();
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});
