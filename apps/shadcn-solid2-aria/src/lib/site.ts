import { z } from "zod";

export const siteUrl = z
  .url({ protocol: /^https?$/u })
  .parse(import.meta.env.VITE_PUBLIC_URL)
  .replace(/\/$/u, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).href;
}
