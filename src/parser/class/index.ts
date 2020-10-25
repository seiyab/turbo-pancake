import { C, F, SingleParser } from "@masala/parser";

import { Item, blanks, delimiter, inlineString, word } from "@parser/util";

export type ClassDiagram = (Clazz | ClazzRelation)[];

export const classDiagramParser = (): SingleParser<ClassDiagram> =>
  classParser()
    .or(relationParser())
    .flatMap((item) => delimiter().optrep().drop().returns(item))
    .rep()
    .map(({ value }) => value);

type Clazz = Item<
  "class",
  {
    name: string;
    body: Body["value"] | null;
  }
>;

export const classParser = (): SingleParser<Clazz> =>
  C.string("class")
    .drop()
    .flatMap(() => blanks().drop())
    .flatMap(() => classNameParser())
    .flatMap((cls: string) => C.charNotIn("{\n").optrep().drop().returns(cls))
    .flatMap((className: string) =>
      bodyParser()
        .opt()
        .map((maybeBody) => {
          return {
            type: "class" as const,
            value: {
              name: className,
              body: maybeBody.map((b) => b.value).orElse(null),
            },
          };
        })
    )
    .flatMap((cls: Clazz) => delimiter().optrep().drop().returns(cls));

const classNameParser = (): SingleParser<string> =>
  F.try(C.stringLiteral()).or(
    F.not(delimiter())
      .rep()
      .map((chars) => chars.join(""))
  );

type Body = Item<
  "body",
  {
    fields: Field["value"][];
    methods: string[];
  }
>;

export const bodyParser = (): SingleParser<Body> =>
  C.char("{")
    .drop()
    .flatMap(() => delimiter().optrep().drop())
    .flatMap(() =>
      blanks()
        .opt()
        .drop()
        .flatMap(() => fieldParser())
        .flatMap((field) => delimiter().optrep().drop().returns(field))
        .optrep()
    )
    .map(({ value }) => ({
      type: "body",
      value: {
        fields: value.map((v) => v.value),
        methods: [],
      },
    }))
    .flatMap((body) =>
      delimiter().optrep().drop().then(C.char("}").drop()).returns(body)
    );

type Field = Item<"field", string>;

export const fieldParser = (): SingleParser<Field> =>
  F.try(
    C.string("{field}")
      .drop()
      .flatMap(() => blanks().drop())
      .flatMap(() => inlineString())
      .map(
        (value) =>
          ({
            type: "field",
            value,
          } as const)
      )
  ).or(
    C.charNotIn("(){}\n")
      .rep()
      .map(({ value }) => ({
        type: "field",
        value: value.join(""),
      }))
  );

export const relationParser = (): SingleParser<ClazzRelation> =>
  word()
    .flatMap((l: string) => blanks().optrep().drop().returns(l))
    .flatMap((l: string) => linkParser().map((link) => [l, link]))
    .flatMap((x) => blanks().optrep().drop().returns(x))
    .flatMap(([l, link]: [string, Link]) =>
      C.char(":")
        .drop()
        .flatMap(() => blanks().optrep().drop())
        .flatMap(() => inlineString())
        .opt()
        .map((maybeLabel) => [l, link, maybeLabel.orElse(null)])
    )
    .flatMap(([l, link, label]: [string, Link, string | null]) =>
      word().map(
        (r) =>
          ({
            type: "relation",
            value: {
              left: {
                name: l,
                terminalType: link[0],
              },
              right: {
                name: r,
                terminalType: link[1],
              },
              label,
            },
          } as const)
      )
    );

type ClazzRelation = Item<
  "relation",
  {
    left: Terminal;
    right: Terminal;
    label: string | null;
  }
>;

type Terminal = {
  name: string;
  terminalType: TerminalType;
};

export const TerminalType = {
  Extension: "Extension", // --|>
  Composition: "Composition", // --*
  Aggregation: "Aggregation", // --o
  None: "None", // --
  Square: "Square", // --#
  Cross: "Cross", // --x
  Nest: "Nest", // --+
  Many: "Many", // --{
} as const;

type TerminalType = typeof TerminalType[keyof typeof TerminalType];

type Link = [TerminalType, TerminalType];

const linkParser = (): SingleParser<Link> =>
  leftTerminal()
    .opt()
    .map((l) => l.orElse(TerminalType.None))
    .flatMap((l: TerminalType) =>
      C.string("--").drop().or(C.string("..").drop()).returns(l)
    )
    .flatMap((l: TerminalType) =>
      rightTerminal()
        .opt()
        .map(
          (r) => <[TerminalType, TerminalType]>[l, r.orElse(TerminalType.None)]
        )
    );

const leftTerminal = (): SingleParser<TerminalType> =>
  C.string("<|")
    .map(() => TerminalType.Extension)
    .or(C.char("*").map(() => TerminalType.Composition))
    .or(C.char("o").map(() => TerminalType.Aggregation))
    .or(C.char("#").map(() => TerminalType.Square))
    .or(C.char("x").map(() => TerminalType.Cross))
    .or(C.char("+").map(() => TerminalType.Nest))
    .or(C.char("}").map(() => TerminalType.Many))
    .or(C.char("^").map(() => TerminalType.Extension));

const rightTerminal = (): SingleParser<TerminalType> =>
  C.string("|>")
    .map(() => TerminalType.Extension)
    .or(C.char("*").map(() => TerminalType.Composition))
    .or(C.char("o").map(() => TerminalType.Aggregation))
    .or(C.char("#").map(() => TerminalType.Square))
    .or(C.char("x").map(() => TerminalType.Cross))
    .or(C.char("+").map(() => TerminalType.Nest))
    .or(C.char("{").map(() => TerminalType.Many))
    .or(C.char("^").map(() => TerminalType.Extension));
