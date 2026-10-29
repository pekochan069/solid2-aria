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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useLabels.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";
import { createMemo } from "solid-js";

import { createId } from "./create-id";
import { isTruthy } from "./truthy";

/** Combines an explicit label with references while preserving reactive inputs. */
export function createLabels(
  props: DOMProps & AriaLabelingProps,
  defaultLabel?: string | Accessor<string | undefined>
): DOMProps & AriaLabelingProps {
  const id = createId(() => props.id);

  const labelledBy = createMemo(() => {
    const label = props["aria-label"];
    const references = props["aria-labelledby"];

    if (isTruthy(references) && isTruthy(label)) {
      return [...new Set([id(), ...references.trim().split(/\s+/u)])].join(" ");
    }

    return isTruthy(references)
      ? references.trim().split(/\s+/u).join(" ")
      : references;
  });

  return {
    get "aria-label"() {
      const label = props["aria-label"];

      if (!isTruthy(label) && !isTruthy(labelledBy())) {
        return typeof defaultLabel === "function"
          ? defaultLabel()
          : defaultLabel;
      }

      return label;
    },
    get "aria-labelledby"() {
      return labelledBy();
    },
    get id() {
      return id();
    },
  };
}
