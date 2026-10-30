/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/lib/highlight-code.ts and apps/v4/hooks/use-config.ts.
 * Modified for Solid Aria: Solid 2 request-scoped selection, browser persistence, and conversion from Bun commands.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { Accessor, ParentProps } from "solid-js";
import { createContext, createSignal, onSettled } from "solid-js";

export const packageManagers = ["npm", "pnpm", "bun", "yarn"] as const;

type PackageManager = (typeof packageManagers)[number];

export type PackageManagerCommands = Record<PackageManager, string>;

const storageKey = "shadcn-solid2-package-manager";

export const PackageManagerContext = createContext<{
  selected: Accessor<PackageManager>;
  select: (value: PackageManager) => void;
}>();

export function PackageManagerProvider(props: ParentProps) {
  const [selected, setSelected] = createSignal<PackageManager>("bun");

  onSettled(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const value = packageManagers.find((manager) => manager === stored);

      if (value) {
        setSelected(value);
      }
    } catch {
      // Selection remains available when browser storage is blocked.
    }
  });

  function select(value: PackageManager) {
    setSelected(value);

    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Keep the shared selection when browser storage is blocked.
    }
  }

  return (
    <PackageManagerContext value={{ select, selected }}>
      {props.children}
    </PackageManagerContext>
  );
}

export function getPackageManagerCommands(
  code: string
): PackageManagerCommands | undefined {
  if (!/^[\t ]*(?:bun (?:add|run)\b|bunx(?: --bun)?\s)/mu.test(code)) {
    return undefined;
  }

  function convert(install: string, execute: string, run: string) {
    return code
      .replaceAll(
        /^(?<indent>[\t ]*)bun add\b(?<args>[^\n]*)/gmu,
        (_, indent: string, args: string) =>
          `${indent}${install}${args.replaceAll(/(?<space>^|\s)-d(?=\s|$)/gu, "$<space>--save-dev")}`
      )
      .replaceAll(
        /^(?<indent>[\t ]*)bunx(?: --bun)?\s/gmu,
        `$<indent>${execute} `
      )
      .replaceAll(/^(?<indent>[\t ]*)bun run\b/gmu, `$<indent>${run}`);
  }

  return {
    bun: code,
    npm: convert("npm install", "npx", "npm run"),
    pnpm: convert("pnpm add", "pnpm dlx", "pnpm run"),
    yarn: convert("yarn add", "yarn dlx", "yarn"),
  };
}
