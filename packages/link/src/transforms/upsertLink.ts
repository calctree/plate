import type { ValueOf } from '@udecode/plate-common';

import {
  type InsertNodesOptions,
  type PlateEditor,
  type UnwrapNodesOptions,
  type Value,
  type WrapNodesOptions,
  findNode,
  getAboveNode,
  getEditorString,
  getNodeLeaf,
  getNodeProps,
  getPluginType,
  isDefined,
  isExpanded,
  removeNodes,
  setNodes,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../LinkPlugin';
import { type CreateLinkNodeOptions, validateUrl } from '../utils/index';
import { insertLink } from './insertLink';
import { unwrapLink } from './unwrapLink';
import { upsertLinkText } from './upsertLinkText';
import { wrapLink } from './wrapLink';

export type UpsertLinkOptions<V extends Value = Value> = {
  insertNodesOptions?: InsertNodesOptions<V>;
  /** If true, insert text when selection is in url. */
  insertTextInLink?: boolean;
  skipValidation?: boolean;
  unwrapNodesOptions?: UnwrapNodesOptions<V>;
  wrapNodesOptions?: WrapNodesOptions<V>;
} & CreateLinkNodeOptions;

/**
 * If selection in a link or is not url:
 *
 * - Insert text with url, exit If selection is expanded or `update` in a link:
 * - Remove link node, get link text Then:
 * - Insert link node
 */
export const upsertLink = <E extends PlateEditor>(
  editor: E,
  {
    insertNodesOptions,
    insertTextInLink,
    skipValidation = false,
    target,
    text,
    url,
  }: UpsertLinkOptions<ValueOf<E>>
) => {
  const at = editor.selection;

  if (!at) return;

  const linkAbove = getAboveNode<TLinkElement>(editor, {
    at,
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  // anchor and focus in link -> insert text
  if (insertTextInLink && linkAbove) {
    // we don't want to insert marks in links
    editor.insertText(url);

    return true;
  }
  if (!skipValidation && !validateUrl(editor, url)) return;
  if (isDefined(text) && text.length === 0) {
    text = url;
  }
  // edit the link url and/or target
  if (linkAbove) {
    if (url !== linkAbove[0]?.url || target !== linkAbove[0]?.target) {
      setNodes<TLinkElement>(
        editor,
        { target, url },
        {
          at: linkAbove[1],
        }
      );
    }

    upsertLinkText(editor, { target, text, url });

    return true;
  }

  // selection contains at one edge edge or between the edges
  const linkEntry = findNode<TLinkElement>(editor, {
    at,
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  const [linkNode, linkPath] = linkEntry ?? [];

  let shouldReplaceText = false;

  if (linkPath && text?.length) {
    const linkText = getEditorString(editor, linkPath);

    if (text !== linkText) {
      shouldReplaceText = true;
    }
  }
  if (isExpanded(at)) {
    // anchor and focus in link
    if (linkAbove) {
      unwrapLink(editor, {
        at: linkAbove[1],
      });
    } else {
      unwrapLink(editor, {
        split: true,
      });
    }

    wrapLink(editor, {
      target,
      url,
    });

    upsertLinkText(editor, { target, text, url });

    return true;
  }
  if (shouldReplaceText) {
    removeNodes(editor, {
      at: linkPath,
    });
  }

  const props = getNodeProps(linkNode ?? ({} as any));

  const path = editor.selection?.focus.path;

  if (!path) return;

  // link text should have the focused leaf marks
  const leaf = getNodeLeaf(editor, path);

  // if text is empty, text is url
  if (!text?.length) {
    text = url;
  }

  insertLink(
    editor,
    {
      ...props,
      children: [
        {
          ...leaf,
          text,
        },
      ],
      target,
      url,
    },
    insertNodesOptions
  );

  return true;
};
