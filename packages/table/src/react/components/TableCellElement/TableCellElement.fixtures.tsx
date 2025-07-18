/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

jsx;

export const a = (
  <editor>
    <htable>
      <htr>
        <htd>
          <anchor />a
        </htd>
        <htd>
          b<focus />
        </htd>
      </htr>
    </htable>
  </editor>
) as any;

export const tableInput = Object.freeze([
  {
    children: [
      {
        children: [
          { children: [{ text: 'A1' }], type: 'td' },
          { children: [{ text: 'B1' }], type: 'td' },
        ],
        type: 'tr',
      },
      {
        children: [
          { children: [{ text: 'A2' }], type: 'td' },
          { children: [{ text: 'B2' }], type: 'td' },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },
]) as any;
