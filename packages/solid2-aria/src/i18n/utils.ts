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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isPresent } from "../utils/is-present";
import { readProperty } from "../utils/read-property";
import { isTruthy } from "../utils/truthy";

// https://en.wikipedia.org/wiki/Right-to-left
const RTL_SCRIPTS = new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
]);

const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/**
 * Determines if a locale is read right to left using
 * [Intl.Locale]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale}.
 */
export function isRTL(localeString: string): boolean {
  // If the Intl.Locale API is available, use it to get the locale's text direction.
  if (isTruthy(Intl.Locale)) {
    const locale = new Intl.Locale(localeString).maximize();

    // Use the text info object to get the direction if possible.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
    const textInfo: unknown =
      typeof locale.getTextInfo === "function"
        ? locale.getTextInfo()
        : readProperty(locale, "textInfo");

    if (
      isPresent(textInfo) &&
      typeof textInfo === "object" &&
      "direction" in textInfo
    ) {
      return textInfo.direction === "rtl";
    }

    // Fallback: guess using the script.
    // This is more accurate than guessing by language, since languages can be written in multiple scripts.
    if (isTruthy(locale.script)) {
      return RTL_SCRIPTS.has(locale.script);
    }
  }

  // If not, just guess by the language (first part of the locale)
  const lang = localeString.split("-")[0] ?? "";

  return RTL_LANGS.has(lang);
}
