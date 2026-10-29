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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useNumberFormatter.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { NumberFormatter } from "@internationalized/number";
import type { NumberFormatOptions } from "@internationalized/number";
import { untrack, createMemo, merge } from "solid-js";

import { createLocale } from "./i18n-provider";

/**
 * Provides localized number formatting for the current locale. Automatically updates when the
 * locale changes, and handles caching of the number formatter for performance.
 *
 * @param options - Formatting options.
 */
export function createNumberFormatter(
  options: NumberFormatOptions = {}
): Intl.NumberFormat {
  const _result1 = createLocale();

  const _memo0 = createMemo(
    () => new NumberFormatter(_result1.locale, options)
  );

  return untrack(() => merge(_memo0));
}
