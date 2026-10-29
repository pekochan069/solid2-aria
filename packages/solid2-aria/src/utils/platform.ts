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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/platform.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isPresent } from "./is-present";
import { readProperty } from "./read-property";
import { getTruthyValue } from "./truthy";

function testUserAgent(re: RegExp) {
  if (
    typeof window === "undefined" ||
    window.navigator === null ||
    window.navigator === undefined
  ) {
    return false;
  }

  const { brands } = getUserAgentData();

  return (
    (Array.isArray(brands) &&
      brands.some((brand: { brand: string }) => re.test(brand.brand))) ||
    re.test(window.navigator.userAgent)
  );
}

function testPlatform(re: RegExp) {
  return typeof window !== "undefined" &&
    window.navigator !== null &&
    window.navigator !== undefined
    ? re.test(
        getTruthyValue(getUserAgentData().platform) ?? window.navigator.platform
      )
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }

  let res: boolean | null = null;

  return () => {
    res ??= fn();

    return res;
  };
}

export const isMac: () => boolean = cached(() => testPlatform(/^Mac/iu));

export const isIPhone: () => boolean = cached(() => testPlatform(/^iPhone/iu));

export const isIPad: () => boolean = cached(
  () =>
    testPlatform(/^iPad/iu) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1)
);

export const isIOS: () => boolean = cached(() => isIPhone() || isIPad());

export const isAppleDevice: () => boolean = cached(() => isMac() || isIOS());

export const isChrome: () => boolean = cached(() =>
  testUserAgent(/Chrome|CriOS|CrMo/iu)
);

export const isFirefox: () => boolean = cached(() =>
  testUserAgent(/(?:Firefox|FxiOS)/iu)
);

export const isWebKit: () => boolean = cached(
  () => testUserAgent(/AppleWebKit/iu) && (isIOS() || !isChrome())
);

export const isSafari: () => boolean = cached(
  () => isWebKit() && !isChrome() && !isFirefox()
);

export const isAndroid: () => boolean = cached(() =>
  testUserAgent(/Android/iu)
);

interface UserAgentData {
  brands: { brand: string }[];
  platform?: string;
}

function getUserAgentData(): UserAgentData {
  const data = readProperty(window.navigator, "userAgentData");

  if (!isPresent(data) || typeof data !== "object") {
    return { brands: [] };
  }

  const brands =
    "brands" in data && Array.isArray(data.brands)
      ? data.brands.filter(
          (item: unknown): item is { brand: string } =>
            item !== null &&
            typeof item === "object" &&
            "brand" in item &&
            typeof item.brand === "string"
        )
      : [];

  const platform =
    "platform" in data && typeof data.platform === "string"
      ? data.platform
      : undefined;

  return { brands, platform };
}
