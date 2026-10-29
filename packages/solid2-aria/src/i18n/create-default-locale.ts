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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/useDefaultLocale.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createSignal, onSettled } from "solid-js";

import { readProperty } from "../utils/read-property";
import { getTruthyValue, whenTruthy } from "../utils/truthy";
import type { Locale } from "./i18n-provider";
import { isRTL } from "./utils";

// Locale passed from server by PackageLocalizationProvider.
const localeSymbol = Symbol.for("react-aria.i18n.locale");

/**
 * Gets the locale setting of the browser.
 */
function getServerLocale(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const value = readProperty(window, localeSymbol);

  return typeof value === "string" ? value : undefined;
}

export function getDefaultLocale(): Locale {
  const legacyLanguage =
    typeof navigator !== "undefined" &&
    "userLanguage" in navigator &&
    typeof navigator.userLanguage === "string"
      ? navigator.userLanguage
      : undefined;

  let locale =
    getTruthyValue(
      getTruthyValue(
        whenTruthy(typeof window !== "undefined", () => getServerLocale())
      ) ??
        whenTruthy(
          typeof navigator !== "undefined",
          () => getTruthyValue(navigator.language) ?? legacyLanguage
        )
    ) ?? "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return {
    direction: isRTL(locale) ? "rtl" : "ltr",
    locale,
  };
}

let currentLocale = getDefaultLocale();
const listeners = new Set<(locale: Locale) => void>();

function updateLocale() {
  currentLocale = getDefaultLocale();

  for (const listener of listeners) {
    listener(currentLocale);
  }
}

/**
 * Returns the current browser/system language, and updates when it changes.
 */
export function createDefaultLocale(): Locale {
  const [mounted, setMounted] = createSignal(false);

  const [defaultLocale, setDefaultLocale] = createSignal(currentLocale, {
    ownedWrite: true,
  });

  const update = (locale: Locale) => {
    setDefaultLocale(locale);
  };

  onSettled(() => {
    setMounted(true);

    if (listeners.size === 0) {
      window.addEventListener("languagechange", updateLocale);
    }

    listeners.add(update);

    return () => {
      listeners.delete(update);

      if (listeners.size === 0) {
        window.removeEventListener("languagechange", updateLocale);
      }
    };
  });

  return {
    get direction() {
      return mounted() ? defaultLocale().direction : "ltr";
    },
    get locale() {
      return mounted()
        ? defaultLocale().locale
        : (getServerLocale() ?? "en-US");
    },
  };
}
