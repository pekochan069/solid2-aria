import type { CalendarIdentifier } from "@internationalized/date";

const CALENDAR_IDENTIFIERS = [
  "gregory",
  "buddhist",
  "chinese",
  "coptic",
  "dangi",
  "ethioaa",
  "ethiopic",
  "hebrew",
  "indian",
  "islamic",
  "islamic-umalqura",
  "islamic-tbla",
  "islamic-civil",
  "islamic-rgsa",
  "iso8601",
  "japanese",
  "persian",
  "roc",
] as const satisfies readonly CalendarIdentifier[];

/** Narrow Intl's string calendar identifier before passing it to a calendar factory. */
export function parseCalendarIdentifier(value: string): CalendarIdentifier {
  const identifier = CALENDAR_IDENTIFIERS.find(
    (candidate) => candidate === value
  );

  if (identifier === undefined) {
    throw new RangeError(`Unsupported calendar identifier: ${value}`);
  }

  return identifier;
}
