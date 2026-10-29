/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useLocalizedStringFormatter.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
} from "@internationalized/string";
import type {
  LocalizedString,
  LocalizedStrings,
} from "@internationalized/string";
import { createMemo, merge } from "solid-js";

import { getTruthyValue, whenTruthy } from "../utils/truthy";
import { createLocale } from "./i18n-provider";

const cache = new WeakMap<
  object,
  LocalizedStringDictionary<string, LocalizedString>
>();

function getCachedDictionary<K extends string, T extends LocalizedString>(
  strings: LocalizedStrings<K, T>
): LocalizedStringDictionary<K, T> {
  const cached = cache.get(strings);

  if (cached) {
    // SAFETY: Each dictionary is indexed by the exact original strings object, preserving its key and value types.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The WeakMap erases the string object's generic dictionary parameters.
    return cached as LocalizedStringDictionary<K, T>;
  }

  const dictionary = new LocalizedStringDictionary(strings);
  cache.set(strings, dictionary);

  return dictionary;
}

/**
 * Returns a cached LocalizedStringDictionary for the given strings.
 */
export function createLocalizedStringDictionary<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringDictionary<K, T> {
  return (
    getTruthyValue(
      whenTruthy(packageName, (truthyValue0) =>
        LocalizedStringDictionary.getGlobalDictionaryForPackage(truthyValue0)
      )
    ) ?? getCachedDictionary(strings)
  );
}

/**
 * Provides localized string formatting for the current locale. Supports interpolating variables,
 * selecting the correct pluralization, and formatting numbers. Automatically updates when the
 * locale changes.
 *
 * @param strings - A mapping of languages to localized strings by key.
 */
export function createLocalizedStringFormatter<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): Pick<LocalizedStringFormatter<K, T>, "format"> {
  const _result1 = createLocale();
  const dictionary = createLocalizedStringDictionary(strings, packageName);

  const _memo0 = createMemo(
    () => new LocalizedStringFormatter(_result1.locale, dictionary)
  );

  const formatter = merge(() => _memo0());

  return formatter;
}
