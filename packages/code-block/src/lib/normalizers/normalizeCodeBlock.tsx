import {
  type NodeEntry,
  type SlateEditor,
  ElementApi,
  getChildren,
} from '@udecode/plate';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

/** Normalize code block node to force the pre>code>div.codeline structure. */
export const normalizeCodeBlock = (editor: SlateEditor) => {
  const codeBlockType = editor.getType(BaseCodeBlockPlugin);
  const codeLineType = editor.getType(BaseCodeLinePlugin);

  const { normalizeNode } = editor;

  return ([node, path]: NodeEntry) => {
    normalizeNode([node, path]);

    if (!ElementApi.isElement(node)) {
      return;
    }

    const isCodeBlockRoot = node.type === codeBlockType;

    if (isCodeBlockRoot) {
      // Children should all be code lines
      const nonCodeLine = getChildren([node, path]).find(
        ([child]) => child.type !== codeLineType
      );

      if (nonCodeLine) {
        editor.tf.setNodes({ type: codeLineType }, { at: nonCodeLine[1] });
      }
    }
  };
};
