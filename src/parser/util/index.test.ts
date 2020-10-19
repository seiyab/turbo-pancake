import { Streams } from '@masala/parser';

import { inlineString } from '.';

describe('inlineString', () => {
  it('works', () => {
    const input = 'foobar\nbaz';
    const { value: result } = inlineString().parse(Streams.ofString(input));
    expect(result).toBe('foobar');
  });
});
