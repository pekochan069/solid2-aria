/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useCollator.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo } from "solid-js";

import { createLocale } from "./i18n-provider";

const cache = new Map<string, Intl.Collator>();

/**
 * Provides localized string collation for the current locale. Automatically updates when the locale
 * changes, and handles caching of the collator for performance.
 *
 * @param options - Collator options.
 */
export function createCollator(options?: Intl.CollatorOptions): Intl.Collator {
  const _result0 = createLocale();

  const cacheKey = createMemo(
    () =>
      _result0.locale +
      (options
        ? Object.entries(options)
            .toSorted((a, b) => (a[0] < b[0] ? -1 : 1))
            .join(",")
        : "")
  );

  const current = createMemo(() => {
    const key = cacheKey();
    const cached = cache.get(key);

    if (cached) {
      return cached;
    }

    const formatter = new Intl.Collator(_result0.locale, options);
    cache.set(key, formatter);

    return formatter;
  });

  return {
    compare: (first, second) => current().compare(first, second),
    resolvedOptions: () => current().resolvedOptions(),
  };
}
