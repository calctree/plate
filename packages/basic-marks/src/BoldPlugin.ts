import {
  type ToggleMarkPluginOptions,
  createPlugin,
  someHtmlElement,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

export const MARK_BOLD = 'bold';

/** Enables support for bold formatting */
export const BoldPlugin = createPlugin<'bold', ToggleMarkPluginOptions>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.fontWeight === 'normal'),
    rules: [
      { validNodeName: ['STRONG', 'B'] },
      {
        validStyle: {
          fontWeight: ['600', '700', 'bold'],
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,

  key: MARK_BOLD,
  options: {
    hotkey: 'mod+b',
  },
});
