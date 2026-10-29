import fs from "node:fs";

import { requireValue } from "../src/utils/require-value";

(() => {
  const intlDir = "intl";
  const jsonGlob = new Bun.Glob("*.json");

  const jobs = [];

  const dirs = fs
    .readdirSync(intlDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${intlDir}/${entry.name}`);

  for (const dir of dirs) {
    const locales = [...jsonGlob.scanSync(`${dir}/`)]
      .values()
      .filter((localeFile) => {
        const stats = fs.statSync(`${dir}/${localeFile}`);

        return stats.isFile();
      })
      .map((localeFile) =>
        requireValue(
          localeFile.split(".")[0],
          'Expected localeFile.split(".")[0]'
        )
      )
      .toArray()
      .toSorted();

    let barrelFile = "";

    for (const locale of locales) {
      barrelFile += `import ${locale.replace("-", "")} from "./${locale}.json";\n`;
    }

    barrelFile += "\nexport default {\n";

    for (const locale of locales) {
      barrelFile += `  "${locale}": ${locale.replace("-", "")},\n`;
    }

    barrelFile += "};\n";

    jobs.push(Bun.write(`${dir}/index.ts`, barrelFile));
  }

  void Promise.all(jobs);
})();
