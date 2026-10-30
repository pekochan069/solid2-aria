import { vitePluginSatteri } from "@internal/plugins/vite-plugin-satteri";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
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
});
