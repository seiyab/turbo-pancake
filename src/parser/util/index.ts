import { C, F, SingleParser } from "@masala/parser";

export type Item<T extends string, V> = {
  type: T;
  value: Readonly<V>;
};

const lowerAlphabets = "abcdefghijklmnopqrstuvwxyz";
const upperAlphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";

export const blanks = (): SingleParser<string> =>
  C.char(" ")
    .rep()
    .map(({ value }) => value.join(""));

export const eol = (): SingleParser<string> => C.char("\n");

export const delimiter = (): SingleParser<string> =>
  F.try(C.char(" ")).or(F.try(eol()));

export const alphanumericString = (): SingleParser<string> =>
  C.charIn(lowerAlphabets + upperAlphabets + numbers)
    .rep()
    .map((value) => value.join(""));

export const word = alphanumericString;

export const inlineString = (): SingleParser<string> =>
  C.notChar("\n")
    .rep()
    .map(({ value }) => value.join(""));
