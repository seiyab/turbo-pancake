import { C, F, SingleParser } from '@masala/parser';

import { Item, blanks, eol, delimiter, inlineString } from '@parser/util';

type Clazz = Item<'class', {
  name: string;
  body: Body['value'] | null;
}>

export const classParser = (): SingleParser<Clazz> => C.string('class').drop()
  .flatMap(() => blanks().drop())
  .flatMap(() => classNameParser())
  .flatMap((cls: string) => C.charNotIn('{\n').optrep().drop().returns(cls))
  .flatMap((className: string) => bodyParser().opt().map((maybeBody) => {
    return {
      type: 'class' as const,
      value: {
        name: className,
        body: maybeBody.map((b) => b.value).orElse(null),
      }
    }
  }))
  .flatMap((cls: Clazz) => delimiter().optrep().drop().returns(cls))
  ;

const classNameParser = (): SingleParser<string> => F.try(C.stringLiteral())
  .or(F.not(delimiter()).rep().map((chars) => chars.join('')));

type Body = Item<'body', {
  fields: Field['value'][],
  methods: string[],
}>;

export const bodyParser = (): SingleParser<Body> => C.char('{').drop()
  .flatMap(() => delimiter().optrep().drop())
  .flatMap(
    () => blanks().opt().drop().flatMap(
      () => fieldParser()
    ).flatMap((field) => delimiter().optrep().drop().returns(field)).optrep()
  )
  .map(({ value }) => ({
    type: 'body',
    value: {
      fields: value.map((v) => v.value),
      methods: [],
    }
  }))
  .flatMap((body) => delimiter().optrep().drop().then(C.char('}').drop()).returns(body))

type Field = Item<'field', string>;

export const fieldParser = (): SingleParser<Field> => F.try(
  C.string('{field}').drop()
    .flatMap(() => blanks().drop())
    .flatMap(() => inlineString())
    .map((value) => ({
      type: 'field',
      value,
    } as const)),
).or(
  C.charNotIn('(){}\n')
    .rep()
    .map(({value}) => ({
      type: 'field',
      value: value.join(''),
    })),
);
