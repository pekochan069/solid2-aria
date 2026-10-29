import { transform } from "@solidjs/compiler";

Bun.plugin({
  name: "solid-2-test-ssr-jsx",
  setup(builder) {
    builder.onLoad({ filter: /\.[jt]sx$/u }, async ({ path }) => ({
      contents: transform(await Bun.file(path).text(), {
        filename: path,
        generate: "ssr",
        hydratable: true,
      }).code,
      loader: "ts",
    }));
  },
});
