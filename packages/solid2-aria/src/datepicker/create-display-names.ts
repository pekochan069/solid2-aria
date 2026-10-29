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
 * Derived from Adobe React Spectrum: packages/react-aria/src/datepicker/useDisplayNames.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LocalizedStringDictionary } from "@internationalized/string";
import { createMemo } from "solid-js";

import intlMessages from "../../intl/datepicker/index";
import { createLocalizedStringDictionary } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";

type Field = keyof (typeof intlMessages)["en-US"];

interface DisplayNames {
  of: (field: Field) => string | undefined;
}

/** @private */
export function createDisplayNames(): DisplayNames {
  const _result1 = createLocale();

  const dictionary = createLocalizedStringDictionary(
    intlMessages,
    "@react-aria/datepicker"
  );

  const _memo0 = createMemo(() => {
    // Try to use Intl.DisplayNames if possible. It may be supported in browsers, but not support the dateTimeField
    // type as that was only added in v2. https://github.com/tc39/intl-displaynames-v2
    try {
      return new Intl.DisplayNames(_result1.locale, {
        type: "dateTimeField",
      });
    } catch {
      return new DisplayNamesPolyfill(_result1.locale, dictionary);
    }
  });

  return {
    of(field) {
      return _memo0().of(field);
    },
  };
}

class DisplayNamesPolyfill implements DisplayNames {
  private readonly locale: string;
  private readonly dictionary: LocalizedStringDictionary<Field>;
  constructor(locale: string, dictionary: LocalizedStringDictionary<Field>) {
    this.locale = locale;
    this.dictionary = dictionary;
  }
  of(field: Field): string {
    return this.dictionary.getStringForLocale(field, this.locale);
  }
}
