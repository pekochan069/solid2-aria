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
 * Derived from Adobe React Spectrum: packages/react-aria/src/i18n/I18nProvider.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Direction } from "@solid2-aria/types-shared";
import { createContext, useContext } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { isTruthy } from "../utils/truthy";
import { createDefaultLocale } from "./create-default-locale";
import { isRTL } from "./utils";

export interface Locale {
  locale: string;
  direction: Direction;
}

export interface I18nProviderProps {
  children?: SolidElement;
  locale?: string;
}

const I18nContext = createContext<Locale | null>(null);

export function I18nProvider(props: I18nProviderProps): SolidElement {
  const fallback = createDefaultLocale();

  const value: Locale = {
    get direction() {
      if (isTruthy(props.locale)) {
        if (isRTL(props.locale)) {
          return "rtl";
        }

        return "ltr";
      }

      return fallback.direction;
    },
    get locale() {
      return props.locale ?? fallback.locale;
    },
  };

  return <I18nContext value={value}>{props.children}</I18nContext>;
}

export function createLocale(): Locale {
  const context = useContext(I18nContext);

  return context ?? createDefaultLocale();
}
