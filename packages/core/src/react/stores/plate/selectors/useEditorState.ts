import type { PlateEditor } from '../../../../lib';

import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor state which is updated on editor change. */
export const useEditorState = <E extends PlateEditor = PlateEditor>(
  id?: string,
  options: UsePlateEditorStoreOptions = {}
): E => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorState',
    ...options,
  }).trackedEditor().editor;
};
