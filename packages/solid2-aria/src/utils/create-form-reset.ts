/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useFormReset.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

export function createFormReset<T>(
  ref:
    | Accessor<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
      >
    | undefined,
  initialValue: Accessor<T>,
  onReset: (value: T) => void
): void {
  const handleReset = (event: Event) => {
    if (!event.defaultPrevented) {
      onReset(initialValue());
    }
  };

  createEffect(
    () => ref?.()?.form,
    (form) => {
      form?.addEventListener("reset", handleReset);

      return () => {
        form?.removeEventListener("reset", handleReset);
      };
    },
    { ssrSource: "client" }
  );
}
