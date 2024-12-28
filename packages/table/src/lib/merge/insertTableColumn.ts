import {
  type SlateEditor,
  findNode,
  getBlockAbove,
  getLastChildPath,
  getNode,
  getParentNode,
  insertElements,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { getEditorPlugin } from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep.js';
import { Path } from 'slate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';

export const insertTableMergeColumn = (
  editor: SlateEditor,
  {
    at,
    before,
    fromCell,
    header,
    select: shouldSelect,
  }: {
    /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
    at?: Path;
    /** Insert the column before the current column instead of after */
    before?: boolean;
    /** Path of the cell to insert the column from. */
    fromCell?: Path;
    header?: boolean;
    select?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);
  const { initialTableWidth, minColumnWidth } = getOptions();

  if (at && !fromCell) {
    const table = getNode<TTableElement>(editor, at);

    if (table?.type === editor.getType(BaseTablePlugin)) {
      fromCell = getLastChildPath([table.children[0], at.concat([0])]);
      at = undefined;
    }
  }

  const cellEntry = fromCell
    ? findNode<TTableCellElement>(editor, {
        at: fromCell,
        match: { type: getCellTypes(editor) },
      })
    : getBlockAbove<TTableCellElement>(editor, {
        match: { type: getCellTypes(editor) },
      });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;
  const cell = cellEntry[0];

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    at: cellPath,
    match: { type },
  });

  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  const { col: cellColIndex } = getCellIndices(editor, cell);
  const cellColSpan = api.table.getColSpan(cell);

  let nextColIndex: number;
  let checkingColIndex: number;

  if (Path.isPath(at)) {
    nextColIndex = cellColIndex;
    checkingColIndex = cellColIndex - 1;
  } else {
    nextColIndex = before ? cellColIndex : cellColIndex + cellColSpan;
    checkingColIndex = before ? cellColIndex : cellColIndex + cellColSpan - 1;
  }

  const rowNumber = tableNode.children.length;
  const firstCol = nextColIndex <= 0;

  let placementCorrection = before ? 0 : 1;

  if (firstCol) {
    checkingColIndex = 0;
    placementCorrection = 0;
  }

  const affectedCellsSet = new Set();
  Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
    const found = findCellByIndexes(editor, tableNode, rI, checkingColIndex);

    if (found) {
      affectedCellsSet.add(found);
    }
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  affectedCells.forEach((curCell) => {
    const { col: curColIndex, row: curRowIndex } = getCellIndices(
      editor,
      curCell
    );

    const curRowSpan = api.table.getRowSpan(curCell);
    const curColSpan = api.table.getColSpan(curCell);

    const currentCellPath = getCellPath(
      editor,
      tableEntry,
      curRowIndex,
      curColIndex
    );

    const endCurI = curColIndex + curColSpan - 1;

    if (endCurI >= nextColIndex && !firstCol && !before) {
      const colSpan = curColSpan + 1;
      const newCell = cloneDeep({ ...curCell, colSpan });

      if (newCell.attributes?.colspan) {
        newCell.attributes.colspan = colSpan.toString();
      }

      setNodes<TTableCellElement>(editor, newCell, { at: currentCellPath });
    } else {
      const curRowPath = currentCellPath.slice(0, -1);
      const curColPath = currentCellPath.at(-1)!;
      const placementPath = [
        ...curRowPath,
        before ? curColPath : curColPath + placementCorrection,
      ];

      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = {
        ...api.create.tableCell({ header, row: rowElement }),
        colSpan: 1,
        rowSpan: curRowSpan,
      };
      insertElements(editor, emptyCell, {
        at: placementPath,
        select: shouldSelect,
      });
    }
  });

  withoutNormalizing(editor, () => {
    const { colSizes } = tableNode;

    if (colSizes) {
      let newColSizes = [
        ...colSizes.slice(0, nextColIndex),
        0,
        ...colSizes.slice(nextColIndex),
      ];

      if (initialTableWidth) {
        newColSizes[nextColIndex] =
          colSizes[nextColIndex] ??
          colSizes[nextColIndex - 1] ??
          initialTableWidth / colSizes.length;

        const oldTotal = colSizes.reduce((a, b) => a + b, 0);
        const newTotal = newColSizes.reduce((a, b) => a + b, 0);
        const maxTotal = Math.max(oldTotal, initialTableWidth);

        if (newTotal > maxTotal) {
          const factor = maxTotal / newTotal;
          newColSizes = newColSizes.map((size) =>
            Math.max(minColumnWidth ?? 0, Math.floor(size * factor))
          );
        }
      }

      setNodes<TTableElement>(
        editor,
        {
          colSizes: newColSizes,
        },
        {
          at: tablePath,
        }
      );
    }
  });
};
