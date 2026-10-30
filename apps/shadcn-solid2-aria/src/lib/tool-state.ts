/* oxlint-disable promise/prefer-await-to-then -- Zod catch methods define schema defaults. */
import { createEffect, createMemo, createSignal, onSettled } from "solid-js";
import { z } from "zod";

import { baseColorNames, themeNames } from "./tool-data/themes";

export const styleNames = [
  "vega",
  "nova",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
] as const;

export const fontNames = ["geist", "inter", "sans", "serif", "mono"] as const;

export const fontFamilies = {
  geist: '"Geist", sans-serif',
  inter: '"Inter", sans-serif',
  mono: '"Geist Mono", monospace',
  sans: "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

export const designFields = z.object({
  baseColor: z.enum(baseColorNames).catch("neutral"),
  chartColor: z.enum(themeNames).catch("neutral"),
  font: z.enum(fontNames).catch("inter"),
  fontHeading: z.enum(["inherit", ...fontNames]).catch("inherit"),
  item: z
    .string()
    .regex(/^[\w-]+$/u)
    .catch("preview-02"),
  menuAccent: z.enum(["subtle", "bold"]).catch("subtle"),
  menuColor: z.enum(["default", "inverted"]).catch("default"),
  radius: z.enum(["0", "0.3", "0.625", "1"]).catch("0.625"),
  rtl: z.enum(["true", "false"]).catch("false"),
  style: z.enum(styleNames).catch("nova"),
  theme: z.enum(themeNames).catch("neutral"),
});

export const designSchema = designFields.transform((config) => ({
  ...config,
  chartColor: baseColorNames.some((name) => name === config.chartColor)
    ? config.baseColor
    : config.chartColor,
  theme: baseColorNames.some((name) => name === config.theme)
    ? config.baseColor
    : config.theme,
}));

export const designPreviewMessageSchema = z.object({
  data: designSchema,
  type: z.literal("design-system-params"),
});

export const typesetSchema = z.object({
  body: z.enum(fontNames).catch("geist"),
  flow: z.enum(["1em", "1.25em", "2em"]).catch("1.25em"),
  heading: z.enum(["inherit", ...fontNames]).catch("inherit"),
  item: z
    .enum([
      "docs",
      "chat",
      "article",
      "changelog",
      "notes",
      "recipe",
      "elements",
      "tailwind",
    ])
    .catch("docs"),
  leading: z.enum(["1.6", "1.75", "1.9"]).catch("1.75"),
  measure: z.enum(["60", "70", "80", "90"]).catch("80"),
  mono: z.enum(fontNames).catch("mono"),
  scale: z.enum(["14", "15", "16", "18"]).catch("15"),
});

export type DesignConfig = z.infer<typeof designSchema>;

export type TypesetConfig = z.infer<typeof typesetSchema>;

export const themeColors = {
  blue: "oklch(0.55 0.22 260)",
  green: "oklch(0.52 0.17 150)",
  neutral: "oklch(0.205 0 0)",
  orange: "oklch(0.65 0.20 40)",
  rose: "oklch(0.57 0.22 15)",
  violet: "oklch(0.54 0.24 295)",
};

export function createToolState<T extends object>(
  schema: z.ZodType<T>,
  initial: T
) {
  const [history, setHistory] = createSignal([initial]);
  const [position, setPosition] = createSignal(0);
  const value = createMemo(() => history()[position()] ?? initial);

  function change(next: T) {
    const entries = history().slice(0, position() + 1);
    setHistory([...entries, next]);
    setPosition(entries.length);
  }

  createEffect(
    () => value(),
    (config) => {
      if (typeof window === "undefined") {
        return;
      }

      const url = new URL(location.href);
      url.search = new URLSearchParams(
        Object.entries(config).map(([key, item]) => [key, String(item)])
      ).toString();
      window.history.replaceState(window.history.state, "", url);
    }
  );

  const restore = () => {
    change(
      schema.parse(Object.fromEntries(new URLSearchParams(location.search)))
    );
  };

  onSettled(() => {
    window.addEventListener("popstate", restore);

    return () => {
      window.removeEventListener("popstate", restore);
    };
  });

  return {
    canRedo: () => position() < history().length - 1,
    canUndo: () => position() > 0,
    change,
    redo: () => {
      setPosition((index) => Math.min(history().length - 1, index + 1));
    },
    reset: () => {
      change(schema.parse({}));
    },
    undo: () => {
      setPosition((index) => Math.max(0, index - 1));
    },
    update: <K extends keyof T>(key: K, next: T[K]) => {
      change({ ...value(), [key]: next });
    },
    value,
  };
}
