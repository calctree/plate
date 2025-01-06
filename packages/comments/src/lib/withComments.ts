import type { ExtendEditor } from '@udecode/plate';

import {
  type BaseCommentsConfig,
  BaseCommentsPlugin,
} from './BaseCommentsPlugin';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils';

export const withComments: ExtendEditor<BaseCommentsConfig> = ({ editor }) => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    removeCommentMark(editor);

    insertBreak();
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset CommentsPlugin.key prop when there is no comments
    if (node[BaseCommentsPlugin.key] && getCommentCount(node as any) < 1) {
      editor.tf.unsetNodes(BaseCommentsPlugin.key, { at: path });

      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
