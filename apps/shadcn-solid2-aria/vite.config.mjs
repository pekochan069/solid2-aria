import { vitePluginSatteri } from "@internal/plugins/vite-plugin-satteri";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import { z } from "zod";

export default defineConfig(({ mode }) => {
  z.url({
    error:
      "Set VITE_PUBLIC_URL to the site's public HTTP(S) origin before starting or building.",
    protocol: /^https?$/u,
  }).parse(loadEnv(mode, process.cwd(), "VITE_").VITE_PUBLIC_URL);

  return {
    plugins: [
      vitePluginSatteri({ codeBlockImport: "#components/docs/code" }),
      tailwindcss(),
      tanstackStart(),
      nitro(),
      solid({ extensions: [".mdx"], ssr: true }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
