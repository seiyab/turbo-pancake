import { C, SingleParser } from "@masala/parser";

import { inlineString, eol } from "@parser/util";
import { ClassDiagram, classDiagramParser } from "@parser/class";

const startUML = C.string("@startuml");
const endUML = C.string("@enduml");

export const umlParser = (): SingleParser<Diagram> =>
  startUML
    .drop()
    .flatMap(() => inlineString().opt().drop())
    .flatMap(() => eol().optrep().drop())
    .flatMap(() => diagramParser())
    .flatMap((d: Diagram) => eol().optrep().drop().returns(d))
    .flatMap((d: Diagram) => endUML.drop().returns(d));

export type Diagram = {
  type: "ClassDiagram";
  diagram: ClassDiagram;
};

const diagramParser = (): SingleParser<Diagram> =>
  classDiagramParser().map((d) => ({
    type: "ClassDiagram",
    diagram: d,
  }));
