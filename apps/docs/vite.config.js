import contentCollections from "@content-collections/vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import { vitePluginSatteri } from "./vite/vite-plugin-satteri.ts";

export default defineConfig({
  plugins: [
    vitePluginSatteri(),
    contentCollections(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    solid({ extensions: [".mdx"], ssr: true }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
