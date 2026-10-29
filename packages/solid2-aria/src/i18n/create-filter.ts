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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useFilter.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { merge } from "solid-js";

import { createCollator } from "./create-collator";

export interface Filter {
  /** Returns whether a string starts with a given substring. */
  startsWith: (string: string, substring: string) => boolean;
  /** Returns whether a string ends with a given substring. */
  endsWith: (string: string, substring: string) => boolean;
  /** Returns whether a string contains a given substring. */
  contains: (string: string, substring: string) => boolean;
}

/**
 * Provides localized string search functionality that is useful for filtering or matching items in
 * a list. Options can be provided to adjust the sensitivity to case, diacritics, and other
 * parameters.
 */
export function createFilter(options?: Intl.CollatorOptions): Filter {
  const collator = createCollator(
    merge(
      {
        get usage() {
          return "search" as const;
        },
      },
      options
    )
  );

  // Follow-up(later): these methods don't currently support the ignorePunctuation option.
  const startsWith = (string: string, substring: string) => {
    let currentString = string;
    let currentSubstring = substring;

    if (currentSubstring.length === 0) {
      return true;
    }

    // Normalize both strings so we can slice safely
    // Follow-up: take into account the ignorePunctuation option as well...
    currentString = currentString.normalize("NFC");
    currentSubstring = currentSubstring.normalize("NFC");

    return (
      collator.compare(
        currentString.slice(0, currentSubstring.length),
        currentSubstring
      ) === 0
    );
  };

  const endsWith = (string: string, substring: string) => {
    let currentString2 = string;
    let currentSubstring2 = substring;

    if (currentSubstring2.length === 0) {
      return true;
    }

    currentString2 = currentString2.normalize("NFC");
    currentSubstring2 = currentSubstring2.normalize("NFC");

    return (
      collator.compare(
        currentString2.slice(-currentSubstring2.length),
        currentSubstring2
      ) === 0
    );
  };

  const contains = (string: string, substring: string) => {
    let currentString3 = string;
    let currentSubstring3 = substring;

    if (currentSubstring3.length === 0) {
      return true;
    }

    currentString3 = currentString3.normalize("NFC");
    currentSubstring3 = currentSubstring3.normalize("NFC");
    let scan = 0;
    const sliceLen = currentSubstring3.length;

    for (; scan + sliceLen <= currentString3.length; scan += 1) {
      const slice = currentString3.slice(scan, scan + sliceLen);

      if (collator.compare(currentSubstring3, slice) === 0) {
        return true;
      }
    }

    return false;
  };

  return { contains, endsWith, startsWith };
}
