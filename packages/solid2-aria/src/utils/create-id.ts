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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useId.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2;
 * preserve matching server and client lifecycle scopes for hydration IDs.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isServer } from "@solidjs/web";
import type { Accessor, Setter } from "solid-js";
import {
  createEffect,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onSettled,
  untrack,
} from "solid-js";

import { createValueEffect } from "./create-value-effect";
import { isTruthy } from "./truthy";

export const idsUpdaterMap = new Map<string, Setter<string | null>[]>();

export function createId(
  defaultId?: string | Accessor<string | undefined>
): Accessor<string> {
  const fallback = `solid2-aria-${createUniqueId()}`;

  const [merged, setMerged] = createSignal<string | null>(null, {
    ownedWrite: true,
  });

  const read = () =>
    merged() ??
    (typeof defaultId === "function" ? defaultId() : defaultId) ??
    fallback;

  let registered = untrack(read);

  const add = (id: string) => {
    const values = idsUpdaterMap.get(id) ?? [];
    values.push(setMerged);
    idsUpdaterMap.set(id, values);
  };

  const remove = (id: string) => {
    const values = idsUpdaterMap
      .get(id)
      ?.filter((value) => value !== setMerged);

    if (isTruthy(values?.length)) {
      idsUpdaterMap.set(id, values);
    } else {
      idsUpdaterMap.delete(id);
    }
  };

  if (!isServer) {
    add(registered);
  }

  createRenderEffect(
    read,
    (id) => {
      if (id !== registered) {
        remove(registered);
        add(id);
        registered = id;
      }
    },
    { ssrSource: "client" }
  );
  onSettled(() => () => {
    remove(registered);
  });

  return read;
}

export function mergeIds(idA: string, idB: string): string {
  if (idA === idB) {
    return idA;
  }

  const first = idsUpdaterMap.get(idA);

  if (first) {
    for (const update of first) {
      update(idB);
    }

    return idB;
  }

  const second = idsUpdaterMap.get(idB);

  if (second) {
    for (const update of second) {
      update(idA);
    }

    return idA;
  }

  return idB;
}

export function createSlotId(
  dependencies: readonly unknown[] | Accessor<readonly unknown[]> = []
): Accessor<string | undefined> {
  const id = createId();

  const [resolved, setResolved] = createValueEffect<string | undefined>(
    untrack(id)
  );

  createEffect(
    () => [
      id(),
      ...(typeof dependencies === "function" ? dependencies() : dependencies),
    ],
    (values) => {
      const [currentId] = values;

      if (typeof currentId !== "string") {
        return;
      }

      setResolved(function* yieldedValues() {
        yield currentId;
        yield document.querySelector(`#${currentId}`) ? currentId : undefined;
      });
    },
    { ssrSource: "client" }
  );

  return resolved;
}
