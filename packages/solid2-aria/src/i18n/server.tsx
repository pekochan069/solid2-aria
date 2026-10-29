/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/server.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LocalizedString } from "@internationalized/string";
import type { JSX } from "@solidjs/web";

import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";

interface PackageLocalizedStrings {
  [packageName: string]: Record<string, LocalizedString>;
}

interface PackageLocalizationProviderProps {
  locale: string;
  strings: PackageLocalizedStrings;
  nonce?: string;
}

/**
 * A PackageLocalizationProvider can be rendered on the server to inject the localized strings
 * needed by the client into the initial HTML.
 */
export function PackageLocalizationProvider(
  props: PackageLocalizationProviderProps
): JSX.Element | null {
  if (typeof document !== "undefined") {
    console.warn(
      "PackageLocalizationProvider should only be rendered on the server."
    );

    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  //  is necessary because the browser
  // remove the nonce parameter from the DOM before hydration
  return (
    <script
      nonce={props.nonce}

      // oxlint-disable-next-line solid/no-innerhtml -- Content comes from trusted local fixtures or escaped localization output.
      innerHTML={getPackageLocalizationScript(props.locale, props.strings)}
    />
  );
}

/**
 * Returns the content for an inline `<script>` tag to inject localized strings into initial HTML.
 */
export function getPackageLocalizationScript(
  locale: string,
  strings: PackageLocalizedStrings
): string {
  return `window[Symbol.for('react-aria.i18n.locale')]=${JSON.stringify(locale)};{${serialize(strings)}}`;
}

const cache = new WeakMap<PackageLocalizedStrings, string>();

function serialize(strings: PackageLocalizedStrings): string {
  const cached = cache.get(strings);

  if (isTruthy(cached)) {
    return cached;
  }

  // Find common strings between packages and hoist them into variables.
  const seen = new Set();
  const common = new Map<string, string>();

  for (const packageStrings of Object.values(strings)) {
    for (const key of Object.keys(packageStrings)) {
      const v = requireValue(
        packageStrings[key],
        "Expected packageStrings[key]"
      );

      const s = typeof v === "string" ? JSON.stringify(v) : v.toString();

      if (seen.has(s) && !common.has(s)) {
        const name = String.fromCodePoint(
          common.size > 25 ? common.size + 97 : common.size + 65
        );

        common.set(s, name);
      }

      seen.add(s);
    }
  }

  let res = "";

  if (common.size > 0) {
    res += "let ";
  }

  for (const [string, name] of common) {
    res += `${name}=${string},`;
  }

  if (common.size > 0) {
    res = `${res.slice(0, -1)};`;
  }

  res += "window[Symbol.for('react-aria.i18n.strings')]={";

  for (const [pkg, packageStrings] of Object.entries(strings)) {
    res += `'${pkg}':{`;

    for (const key of Object.keys(packageStrings)) {
      const v = requireValue(
        packageStrings[key],
        "Expected packageStrings[key]"
      );

      let s = typeof v === "string" ? JSON.stringify(v) : v.toString();

      if (common.has(s)) {
        s = common.get(s) ?? s;
      }

      res += `${/[ ()]/u.test(key) ? JSON.stringify(key) : key}:${s},`;
    }

    res = `${res.slice(0, -1)}},`;
  }

  res = `${res.slice(0, -1)}};`;
  cache.set(strings, res);

  return res;
}
