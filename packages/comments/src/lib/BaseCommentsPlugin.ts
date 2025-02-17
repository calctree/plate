import {
  type EditorNodesOptions,
  type NodeEntry,
  type PluginConfig,
  type SetNodesOptions,
  createTSlatePlugin,
  TextApi,
} from '@udecode/plate';

import type { TCommentText } from './types';

import {
  getCommentCount,
  getCommentId,
  getCommentKey,
  getCommentKeys,
  getDraftCommentKey,
  isCommentKey,
  isCommentNodeById,
} from './utils';
import { withComments } from './withComments';

export type CommentsPluginConfig = PluginConfig<
  'comment',
  {},
  {
    comment: {
      isExist: (options: { id: string }) => boolean;
      node: (
        options?: EditorNodesOptions & { id?: string; isDraft?: boolean }
      ) => NodeEntry<TCommentText> | undefined;
      nodeId: (leaf: TCommentText) => string | undefined;
      nodes: (
        options?: EditorNodesOptions & { id?: string; isDraft?: boolean }
      ) => NodeEntry<TCommentText>[];
    };
  },
  {
    comment: {
      removeMark: () => void;
      setDraft: (options?: SetNodesOptions) => void;
      unsetMark: (options: { id: string }) => void;
    };
  }
>;

export const BaseCommentsPlugin = createTSlatePlugin<CommentsPluginConfig>({
  key: 'comment',
  node: { isLeaf: true },
})
  .overrideEditor(withComments)
  .extendApi<CommentsPluginConfig['api']['comment']>(({ editor, type }) => ({
    isExist: (options: { id: string }): boolean => {
      const { id } = options;

      const regex = new RegExp(`"${getCommentKey(id)}":true`);

      return regex.test(JSON.stringify(editor.children));
    },
    node: (options = {}) => {
      const { id, isDraft, ...rest } = options;

      return editor.api.node<TCommentText>({
        ...rest,
        match: (n) => {
          if (isDraft) return n[type] && n[getDraftCommentKey()];

          return id ? isCommentNodeById(n, id) : n[type];
        },
      });
    },
    nodeId: (leaf) => {
      const ids: string[] = [];
      const keys = Object.keys(leaf);

      if (keys.includes(getDraftCommentKey())) return;

      keys.forEach((key) => {
        if (!isCommentKey(key) || key === getDraftCommentKey()) return;

        // block the resolved id

        const id = getCommentId(key);
        ids.push(id);
      });

      return ids.at(-1);
    },
    nodes: (options = {}) => {
      const { id, isDraft, ...rest } = options;

      return [
        ...editor.api.nodes<TCommentText>({
          ...rest,
          match: (n) => {
            if (isDraft) return n[type] && n[getDraftCommentKey()];
            return id ? isCommentNodeById(n, id) : n[type];
          },
        }),
      ];
    },
  }))
  .extendTransforms<CommentsPluginConfig['transforms']['comment']>(
    ({ api, editor, tf, type }) => ({
      removeMark: () => {
        const nodeEntry = api.comment.node();

        if (!nodeEntry) return;

        const keys = getCommentKeys(nodeEntry[0]);

        editor.tf.withoutNormalizing(() => {
          keys.forEach((key) => {
            editor.tf.removeMark(key);
          });

          editor.tf.removeMark(BaseCommentsPlugin.key);
        });
      },
      setDraft: (options = {}) => {
        tf.setNodes(
          {
            [getDraftCommentKey()]: true,
            [type]: true,
          },
          { match: TextApi.isText, split: true, ...options }
        );
      },
      unsetMark: (options) => {
        const { id } = options;

        const nodes = api.comment.nodes({ id });

        if (!nodes) return;

        nodes.forEach(([node]) => {
          const isOverlapping = getCommentCount(node) > 1;

          let unsetKeys: string[] = [];

          if (isOverlapping) {
            unsetKeys = [getDraftCommentKey(), getCommentKey(id)];
          } else {
            unsetKeys = [
              BaseCommentsPlugin.key,
              getDraftCommentKey(),
              getCommentKey(id),
            ];
          }

          editor.tf.unsetNodes<TCommentText>(unsetKeys, {
            at: [],
            match: (n) => n === node,
          });
        });
      },
    })
  );
