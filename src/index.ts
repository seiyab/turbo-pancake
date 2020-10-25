import { Diagram, umlParser } from "@parser/uml";

export const parsePlantUML = (input: string): Diagram => {
  const result = umlParser().val(input);
  if (!result) {
    throw Error("Failed to parse plantuml");
  }
  return result;
};
