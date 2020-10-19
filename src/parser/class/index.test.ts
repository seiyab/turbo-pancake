import { Streams } from '@masala/parser';

import { bodyParser, classParser, fieldParser } from '.';

describe('classParser', () => {
  it('simple declaration', () => {
    const input = 'class Class01';
    const { value: result } = classParser().parse(Streams.ofString(input));
    expect(result.type).toEqual('class');
    expect(result.value).toEqual({ name: 'Class01', body: null });
  });

  it('double quotes in name', () => {
    const input = 'class "class name with spaces"';
    const { value: result } = classParser().parse(Streams.ofString(input));
    expect(result.type).toEqual('class');
    expect(result.value).toEqual({ name: 'class name with spaces', body: null });
  });

  it('class body', () => {
    const input = [
      'class Foo {',
      '  int id',
      '  String name',
      '}'
    ].join('\n');
    const { value: result } = classParser().parse(Streams.ofString(input));
    expect(result.type).toEqual('class');
    expect(result.value).toEqual(
      {
        name: 'Foo',
        body: {
          fields: [
            'int id',
            'String name',
          ],
          methods: [],
        },
      }
    );
  });

  it('stereotype is not implemented yet', () => {
    const input = [
      'class Class01 << general >>',
      'class Class02 <? extends Class01>',
      '',
    ].join('\n');
    const { value: result } = classParser().rep().parse(Streams.ofString(input));
    expect(result.value).toEqual([
      {
        type: 'class',
        value: { name: 'Class01', body: null },
      },
      { type: 'class',
        value: { name: 'Class02', body: null },
      },
    ])
  })
});

describe('bodyParser', () => {
  it('single field', () => {
    const input = [
      '{',
      '  int foo',
      '}',
    ].join('\n');
    const result = bodyParser().val(input);
    expect(result).toEqual({
      type: 'body',
      value: {
        fields: ['int foo'],
        methods: [],
      }
    })
  })
  it('multiple fields', () => {
    const input = [
      '{',
      '  int foo',
      '  String bar',
      '  boolean baz',
      '}',
    ].join('\n');
    const result = bodyParser().val(input);
    expect(result).toEqual({
      type: 'body',
      value: {
        fields: ['int foo', 'String bar', 'boolean baz'],
        methods: [],
      }
    })
  })
})

describe('fieldParser', () => {
  it('without label', () => {
    const input = 'int id';
    const result = fieldParser().val(input);
    expect(result).toEqual(
      {
        type: 'field',
        value: 'int id',
      },
    );
  });

  it('with label', () => {
    const input = '{field} String word';
    const result = fieldParser().val(input);
    expect(result).toEqual(
      {
        type: 'field',
        value: 'String word',
      },
    );
  });
});
