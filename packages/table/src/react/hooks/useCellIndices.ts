import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import { type TTableCellElement, computeCellIndices } from '../../lib';
import { TablePlugin } from '../TablePlugin';

export const useCellIndices = () => {
  const { editor, useOption } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const cellIndices = useOption('cellIndices', element.id!);

  return React.useMemo(() => {
    if (!cellIndices) {
      return computeCellIndices(editor, {
        cellNode: element,
        setInTimeout: true,
      })!;
    }

    return cellIndices;
  }, [cellIndices, editor, element]);
};
