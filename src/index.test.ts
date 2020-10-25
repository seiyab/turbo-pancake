import fs from "fs/promises";

import { parsePlantUML } from ".";

describe("parsePlantUML", () => {
  it("class diagram", async () => {
    const file = await fs.open(
      __dirname + "/parser/uml/tests/classDiagram.puml",
      "r"
    );
    const buf = await file.readFile();
    const input = buf.toString();

    const result = parsePlantUML(input);

    expect(result.type).toBe("ClassDiagram");
  });

  it("throw if empty string", () => {
    expect(() => {
      parsePlantUML("");
    }).toThrow();
  });
});
