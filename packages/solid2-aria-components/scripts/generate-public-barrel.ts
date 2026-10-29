import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

import { requireValue } from "@solid2-aria/core/utils/require-value";

const packageRoot = path.resolve(import.meta.dirname, "..");

const upstreamRoot = path.resolve(
  process.argv[2] ??
    path.join(
      packageRoot,
      "../../../react-spectrum/packages/react-aria-components"
    )
);

const kebab = (name: string) =>
  name.replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$1-$2").toLowerCase();

const modules = new Map<string, string>();

await Promise.all(
  [
    { directory: "solid2-aria", owner: "@solid2-aria/core" },
    { directory: "solid2-stately", owner: "@solid2-aria/stately" },
  ].map(async ({ owner, directory }) => {
    const sourceRoot = path.resolve(packageRoot, "..", directory, "src");

    for (const file of await readdir(sourceRoot, { recursive: true })) {
      if (/\.tsx?$/u.test(file)) {
        modules.set(
          `${owner}/${path.basename(file).replace(/\.tsx?$/u, "")}`,
          `${owner}/${file.replace(/\.tsx?$/u, "")}`
        );
      }
    }
  })
);

const explicit = new Map<string, string>(
  Object.entries({
    CalendarMonthPickerAria:
      "@solid2-aria/core/calendar/create-calendar-month-picker",
    CalendarSelectionMode: "@solid2-aria/stately/calendar/types",
    CalendarState: "@solid2-aria/stately/calendar/types",
    CalendarYearPickerAria:
      "@solid2-aria/core/calendar/create-calendar-year-picker",
    Collection: "@solid2-aria/core/collections/collection-builder",
    CollectionBuilder: "@solid2-aria/core/collections/collection-builder",
    CollectionProps: "@solid2-aria/core/collections/collection-builder",
    DIRECTORY_DRAG_TYPE: "@solid2-aria/core/dnd/utils",
    DateRange: "@solid2-aria/stately/datepicker/types",
    DateValue: "@solid2-aria/stately/datepicker/types",
    Focusable: "@solid2-aria/core/interactions/create-focusable",
    FormValidationContext:
      "@solid2-aria/stately/form/create-form-validation-state",
    GridLayout: "@solid2-aria/stately/layout/grid-layout",
    GridLayoutOptions: "@solid2-aria/stately/layout/grid-layout",
    I18nProvider: "@solid2-aria/core/i18n/i18n-provider",
    I18nProviderProps: "@solid2-aria/core/i18n/i18n-provider",
    ListLayoutOptions: "@solid2-aria/stately/layout/list-layout",
    Locale: "@solid2-aria/core/i18n/i18n-provider",
    Position: "@solid2-aria/stately/tokenfield/token-field-value",
    RangeCalendarState: "@solid2-aria/stately/calendar/types",
    RouterProvider: "@solid2-aria/core/utils/open-link",
    TableLayoutProps: "@solid2-aria/stately/layout/table-layout",
    TextSegment: "@solid2-aria/stately/tokenfield/token-field-value",
    TimeValue: "@solid2-aria/stately/datepicker/types",
    TokenFieldSegment: "@solid2-aria/stately/tokenfield/token-field-value",
    TokenFieldValue: "@solid2-aria/stately/tokenfield/token-field-value",
    TokenFieldValueOptions: "@solid2-aria/stately/tokenfield/token-field-value",
    TokenSegment: "@solid2-aria/stately/tokenfield/token-field-value",
    WaterfallLayoutOptions: "@solid2-aria/stately/layout/waterfall-layout",
    createBranchComponent: "@solid2-aria/core/collections/collection-builder",
    createLeafComponent: "@solid2-aria/core/collections/collection-builder",
    createLocale: "@solid2-aria/core/i18n/i18n-provider",
    getColorChannels: "@solid2-aria/stately/color/color",
    isDirectoryDropItem: "@solid2-aria/core/dnd/utils",
    isFileDropItem: "@solid2-aria/core/dnd/utils",
    isRTL: "@solid2-aria/core/i18n/utils",
    isTextDropItem: "@solid2-aria/core/dnd/utils",
    parseColor: "@solid2-aria/stately/color/color",
  })
);

for (const name of [
  "Color",
  "ColorAxes",
  "ColorChannel",
  "ColorChannelRange",
  "ColorFormat",
  "ColorSpace",
]) {
  explicit.set(name, "@solid2-aria/stately/color/types");
}

for (const name of ["ListLayout", "WaterfallLayout"]) {
  explicit.set(name, `@solid2-aria/stately/layout/${kebab(name)}`);
}

for (const name of ["Layout", "LayoutInfo", "Point", "Rect", "Size"]) {
  explicit.set(name, `@solid2-aria/stately/virtualizer/${kebab(name)}`);
}

const source = await readFile(
  path.join(upstreamRoot, "exports/index.ts"),
  "utf-8"
);

function targetFor(module: string, imported: string): string {
  if (module.startsWith("../src/")) {
    return `./${kebab(module.slice(7).replace(/^use(?=[A-Z])/u, "create"))}`;
  }

  if (module === "@react-types/shared") {
    return "@solid2-aria/types-shared";
  }

  const override = explicit.get(imported);

  if (override !== undefined) {
    return override;
  }

  const owner = module.startsWith("react-stately/")
    ? "@solid2-aria/stately"
    : "@solid2-aria/core";

  const file = requireValue(
    module.split("/").at(-1),
    "Expected upstream module filename"
  ).replace(/^use(?=[A-Z])/u, "create");

  return requireValue(
    modules.get(`${owner}/${kebab(file)}`),
    `Unmapped ${imported} from ${module}`
  );
}

function declarationsFor(barrel: string): string[] {
  const declarations: string[] = [];
  const seen = new Set<string>();

  for (const match of barrel.matchAll(
    /export\s+(?<type>type\s+)?\{(?<body>[\s\S]*?)\}\s+from\s+['"](?<module>[^'"]+)['"];?/gu
  )) {
    const [, type, body, module] = match;

    if (body === undefined || module === undefined) {
      throw new Error("Invalid upstream export declaration");
    }

    for (const entry of body.split(",")) {
      const [rawImported, alias] = entry.trim().split(/\s+as\s+/u);

      if (rawImported === undefined || rawImported.length === 0) {
        continue;
      }

      const inlineType = rawImported.startsWith("type ");
      const selectedType = type ?? (inlineType ? "type " : "");

      const imported = (
        inlineType ? rawImported.slice(5).trim() : rawImported
      ).replace("ClassNameOrFunction", "ClassOrFunction");

      const publicName = (alias ?? imported).replace(
        /^use(?=[A-Z])/u,
        "create"
      );

      if (publicName === "Provider" || publicName === "SSRProvider") {
        continue;
      }

      if (seen.has(publicName)) {
        continue;
      }

      seen.add(publicName);
      const internal = module.startsWith("../src/");
      const createName = imported.replace(/^use(?=[A-Z])/u, "create");

      const target = targetFor(module, imported);

      const actualName = selectedType.length === 0 ? createName : imported;

      declarations.push(
        `export ${selectedType}{${actualName}${publicName === actualName ? "" : ` as ${publicName}`}} from '${target}';`
      );

      if (
        selectedType.length === 0 &&
        !internal &&
        actualName !== publicName &&
        !seen.has(actualName)
      ) {
        seen.add(actualName);
        declarations.push(`export {${actualName}} from '${target}';`);
      }
    }
  }

  return declarations;
}

const declarations = declarationsFor(source);

await writeFile(
  path.join(packageRoot, "src/index.ts"),
  `// Generated by scripts/generate-public-barrel.ts.\n${declarations.join("\n\n")}\n`
);

console.info(`Generated ${declarations.length} public export declarations.`);
