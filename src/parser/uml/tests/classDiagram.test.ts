import fs from "fs/promises";

import { umlParser } from "../";

it("class diagram", async () => {
  const file = await fs.open(__dirname + "/classDiagram.puml", "r");
  const buf = await file.readFile();
  const input = buf.toString();

  const result = umlParser().val(input);

  expect(result.type).toBe("ClassDiagram");
  expect(result.diagram).toEqual([
    {
      type: "class",
      value: {
        name: "Class01",
        body: null,
      },
    },
    {
      type: "class",
      value: {
        name: "Class02",
        body: null,
      },
    },
    {
      type: "class",
      value: {
        name: "Class03",
        body: {
          fields: ["String name", "boolean isActive"],
          methods: [],
        },
      },
    },
    {
      type: "relation",
      value: {
        left: {
          name: "Class01",
          terminalType: "None",
        },
        right: {
          name: "Class02",
          terminalType: "Extension",
        },
        label: null,
      },
    },
    {
      type: "relation",
      value: {
        left: {
          name: "Class02",
          terminalType: "Aggregation",
        },
        right: {
          name: "Class03",
          terminalType: "None",
        },
        label: null,
      },
    },
  ]);
});
