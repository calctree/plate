import * as React from 'react';
import {
  CodeBlockNodeData,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate-code-block';
import { setNodes } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  TElement,
  useEditorRef,
} from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ReactEditor } from 'slate-react';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export const CodeBlockElement = (props: StyledElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    element,
    classNames,
    prefixClassNames,
    ...rootProps
  } = props;

  const { lang } = element;
  const editor = useEditorRef();
  const { root } = getCodeBlockElementStyles(props);
  const code_block = getPlatePluginOptions(editor, ELEMENT_CODE_BLOCK);
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  return (
    <>
      <pre
        {...attributes}
        css={root.css}
        className={root.className}
        {...nodeProps}
        {...rootProps}
      >
        {code_block?.syntax && (
          <CodeBlockSelectElement
            data-testid="CodeBlockSelectElement"
            lang={lang}
            onChange={(val: string) => {
              const path = ReactEditor.findPath(editor, element);
              setNodes<TElement<CodeBlockNodeData>>(
                editor,
                { lang: val },
                { at: path }
              );
            }}
          />
        )}
        <code className={codeClassName}>{children}</code>
      </pre>
    </>
  );
};
