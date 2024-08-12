import type { PathRef } from 'slate';

import {
  type PlateEditor,
  getChildren,
  getNodeEntry,
  isElement,
  setNodes,
} from '@udecode/plate-common';

import type { TColumnElement, TColumnGroupElement } from '../types';

import { ELEMENT_COLUMN } from '../ColumnPlugin';

export const setColumnWidth = (
  editor: PlateEditor,
  groupPathRef: PathRef,
  layout: Required<TColumnGroupElement>['layout']
) => {
  const path = groupPathRef.unref()!;

  const columnGroup = getNodeEntry(editor, path);

  if (!columnGroup) throw new Error(`can not find the column group in ${path}`);

  const children = getChildren(columnGroup);

  const childPaths = Array.from(children, (item) => item[1]);

  childPaths.forEach((item, index) => {
    const width = layout[index] + '%';

    if (!width) return;

    setNodes<TColumnElement>(
      editor,
      { width: width },
      {
        at: item,
        match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
      }
    );
  });
};
