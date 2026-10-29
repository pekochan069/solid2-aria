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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useDescription.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2;
 * reserve the client effect scope during server rendering for stable hydration IDs.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AriaLabelingProps } from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";
import { createEffect, createSignal } from "solid-js";

import { isTruthy } from "./truthy";

let descriptionId = 0;

const descriptionNodes = new WeakMap<
  Document,
  Map<string, { refCount: number; element: HTMLElement }>
>();

export function createDescription(
  description?: string | Accessor<string | undefined>
): AriaLabelingProps {
  const text = () =>
    typeof description === "function" ? description() : description;

  const [id, setId] = createSignal<string | undefined>(undefined, {
    ownedWrite: true,
  });

  createEffect(
    text,
    (value): undefined | (() => void) => {
      if (!isTruthy(value)) {
        setId(undefined);

        return undefined;
      }

      let nodes = descriptionNodes.get(document);

      if (!nodes) {
        nodes = new Map();
        descriptionNodes.set(document, nodes);
      }

      let entry = nodes.get(value);

      if (!entry) {
        const element = document.createElement("div");
        element.id = `solid2-aria-description-${(descriptionId += 1)}`;
        element.style.display = "none";
        element.textContent = value;
        document.body.append(element);
        entry = { element, refCount: 0 };
        nodes.set(value, entry);
      }

      setId(entry.element.id);
      entry.refCount += 1;
      const current = entry;

      return () => {
        current.refCount -= 1;

        if (current.refCount === 0) {
          current.element.remove();
          nodes.delete(value);
        }
      };
    },
    { ssrSource: "client" }
  );

  return {
    get "aria-describedby"() {
      return id();
    },
  };
}
