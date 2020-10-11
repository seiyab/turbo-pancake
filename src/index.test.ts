import { parse } from "path"

import { parsePlantUML } from '.';

it('parse', () => {
  expect(() => {
    parsePlantUML();
  }).toThrow();
});