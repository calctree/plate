/** @jsx jsxt */
import { jsxt } from '@platejs/test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'dummy_item_after_paragraph';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} lineHeight="115%">
          First bullet point created and then deleted
        </hp>
        <hp lineHeight="115%">A normal paragraph</hp>
        <hp indent={1} lineHeight="115%">
          First bullet point created and then deleted after the normal paragraph
        </hp>
      </editor>
    ),
    filename: name,
  });
});
