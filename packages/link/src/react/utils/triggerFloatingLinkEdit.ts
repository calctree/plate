import {
  type SlateEditor,
  type TLinkElement,
  getEditorPlugin,
  KEYS,
} from 'platejs';

import { LinkPlugin } from '../LinkPlugin';

export const triggerFloatingLinkEdit = (editor: SlateEditor) => {
  const { setOption } = getEditorPlugin(editor, LinkPlugin);

  const entry = editor.api.node<TLinkElement>({
    match: { type: editor.getType(KEYS.link) },
  });

  if (!entry) return;

  const [link, path] = entry;

  let text = editor.api.string(path);

  setOption('url', link.url);
  setOption('newTab', link.target === '_blank');

  if (text === link.url) {
    text = '';
  }

  setOption('text', text);
  setOption('isEditing', true);

  return true;
};
