export function splitSourceNotice(source: string) {
  let end = 0;

  for (const match of source.matchAll(/\/\*[\s\S]*?\*\/\s*/gu)) {
    if (
      match.index !== end ||
      !/Copyright|Derived from|Modified for|@license/u.test(match[0])
    ) {
      break;
    }

    end += match[0].length;
  }

  return { code: source.slice(end), notice: source.slice(0, end).trimEnd() };
}
