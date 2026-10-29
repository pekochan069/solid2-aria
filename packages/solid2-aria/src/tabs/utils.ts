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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tabs/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TabListState } from "@solid2-aria/stately/tabs/create-tab-list-state";
import type { Key } from "@solid2-aria/types-shared";

import { isTruthy } from "../utils/truthy";

export const tabsIds: WeakMap<TabListState<unknown>, string> = new WeakMap<
  TabListState<unknown>,
  string
>();

export function generateId<T>(
  state: TabListState<T> | null,
  key: Key | null | undefined,
  role: string
): string {
  let currentKey = key;

  if (!state) {
    // this case should only happen in the first render before the tabs are registered
    return "";
  }

  if (typeof currentKey === "string") {
    currentKey = currentKey.replaceAll(/\s+/gu, "");
  }

  const baseId = tabsIds.get(state);

  if (process.env.NODE_ENV !== "production" && !isTruthy(baseId)) {
    console.error(
      "There is no tab id, please check if you have rendered the tab panel before the tab list."
    );
  }

  return `${baseId}-${role}-${currentKey}`;
}
