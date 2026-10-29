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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useListFormatter.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo, untrack } from "solid-js";

import { isCallable } from "../utils/is-callable";
import { readProperty } from "../utils/read-property";
import { createLocale } from "./i18n-provider";

export function createListFormatter(
  options: Intl.ListFormatOptions = {}
): Intl.ListFormat {
  const locale = createLocale();

  const formatter = createMemo(
    () => new Intl.ListFormat(locale.locale, options)
  );

  return new Proxy(untrack(formatter), {
    get(_target, property) {
      const instance = formatter();
      const value = readProperty(instance, property);

      if (isCallable(value)) {
        return value.bind(instance);
      }

      return value;
    },
  });
}
