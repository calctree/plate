import type { SlateEditor } from '@udecode/plate';

import { getListItemEntry } from '../index';

export const someList = (editor: SlateEditor, type: string) => {
  return getListItemEntry(editor)?.list?.[0].type === type;
};
