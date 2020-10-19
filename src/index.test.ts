import { parsePlantUML } from '.';

it('parse', () => {
  expect(() => {
    parsePlantUML();
  }).toThrow();
});