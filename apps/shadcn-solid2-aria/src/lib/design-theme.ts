/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/config.ts (buildRegistryTheme) and apps/v4/app/(app)/(create)/components/design-system-provider.tsx.
 * Modified for Solid Aria: build preview and exported theme CSS from local palettes and Solid Create configuration.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { designThemes } from "./tool-data/themes";
import type { ThemePalette } from "./tool-data/themes";
import { fontFamilies } from "./tool-state";
import type { DesignConfig } from "./tool-state";

export function designThemeVariables(config: DesignConfig): ThemePalette {
  const base = designThemes[config.baseColor];
  const theme = designThemes[config.theme];
  const chart = designThemes[config.chartColor];

  const build = (mode: "light" | "dark") => {
    const variables = {
      ...base[mode],
      ...theme[mode],
    };

    for (const key of [
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
    ] as const) {
      variables[key] = chart[mode][key];
    }

    if (config.menuAccent === "bold") {
      variables.accent = variables.primary;
      variables["accent-foreground"] = variables["primary-foreground"];
    }

    return variables;
  };

  return {
    dark: build("dark"),
    light: {
      ...build("light"),
      "font-heading":
        fontFamilies[
          config.fontHeading === "inherit" ? config.font : config.fontHeading
        ],
      "font-sans": fontFamilies[config.font],
      radius: `${config.style === "lyra" || config.style === "sera" ? "0" : config.radius}rem`,
    },
  };
}

function themeRule(selector: string, values: Record<string, string>) {
  return `${selector} {\n${Object.entries(values)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n")}\n}`;
}

export function designThemeCss(config: DesignConfig) {
  const variables = designThemeVariables(config);

  return `${themeRule(":root", variables.light)}\n\n${themeRule(":root.dark", variables.dark)}`;
}
