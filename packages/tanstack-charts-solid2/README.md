# @solid2-aria/tanstack-charts

Solid 2 SVG adapter for `@tanstack/charts`.

## npm and Solid 2 release candidates

`@tanstack/charts` versions 1.0.0 and 1.1.0 declare an optional `solid-js` peer dependency of `>=1.8`. npm excludes prerelease versions such as `2.0.0-rc.17` from that range. If Solid 2 RC is installed, npm can fail with `ERESOLVE`.

If this happens in a consumer project, run this command from the project root:

```sh
npm install --legacy-peer-deps
```

This option skips all peer dependency checks. Verify the project's peer dependencies before using it. Bun 1.4.4 installs this combination without the option.
