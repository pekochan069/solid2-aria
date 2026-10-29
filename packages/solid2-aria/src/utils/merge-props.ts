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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/mergeProps.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { chain } from "./chain";
import { mergeIds } from "./create-id";
import { isPresent } from "./is-present";
import { readProperty } from "./read-property";

type PropsArg = object | null | undefined;

type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type Merged<T extends readonly PropsArg[]> = UnionToIntersection<
  NonNullable<T[number]>
>;

/** Preserve property reads so event callbacks and DOM attributes stay reactive. */
export function mergeProps<T extends readonly PropsArg[]>(
  ...sources: T
): Merged<T> {
  const overrides = {};
  const deleted = new Set<PropertyKey>();

  const keys = () =>
    [
      ...new Set([
        ...sources.flatMap((source) => (source ? Reflect.ownKeys(source) : [])),
        ...Reflect.ownKeys(overrides),
      ]),
    ].filter((key) => !deleted.has(key));

  function read(key: PropertyKey): ReturnType<typeof readProperty> {
    if (typeof key === "symbol") {
      return undefined;
    }

    if (deleted.has(key)) {
      return undefined;
    }

    if (Object.hasOwn(overrides, key)) {
      return readProperty(overrides, key);
    }

    let result: unknown;

    for (const source of sources) {
      if (!source) {
        continue;
      }

      const next = readProperty(source, key);

      result = mergePropertyValue(key, result, next);
    }

    return result;
  }

  // SAFETY: The proxy resolves every property from the generic source tuple, preserving their getters and the published intersection contract.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A dynamic Proxy cannot express the source tuple intersection in its target type.
  return new Proxy(
    {},
    {
      deleteProperty: (_, key) => {
        deleted.add(key);
        Reflect.deleteProperty(overrides, key);

        return true;
      },
      get: (_, key) => read(key),
      getOwnPropertyDescriptor: (_, key) =>
        typeof key === "string" &&
        !deleted.has(key) &&
        (key in overrides ||
          sources.some((source) => isPresent(source) && key in source))
          ? {
              configurable: true,
              enumerable: true,
              get: () => read(key),
            }
          : undefined,
      has: (_, key) =>
        typeof key === "string" &&
        !deleted.has(key) &&
        (key in overrides ||
          sources.some((source) => isPresent(source) && key in source)),
      ownKeys: keys,
      set: (_, key, value) => {
        deleted.delete(key);

        return Reflect.set(overrides, key, value);
      },
    }
  ) as Merged<T>;
}

function mergePropertyValue<Previous, Next>(
  key: PropertyKey,
  previous: Previous,
  next: Next
) {
  if (
    typeof previous === "function" &&
    typeof next === "function" &&
    typeof key === "string" &&
    /^on[A-Z]/u.test(key)
  ) {
    return chain(previous, next);
  } else if (key === "class" && previous !== undefined && next !== undefined) {
    return [previous, next];
  } else if (
    key === "id" &&
    typeof previous === "string" &&
    typeof next === "string" &&
    previous &&
    next
  ) {
    return mergeIds(previous, next);
  } else if (key === "ref" && previous !== undefined && next !== undefined) {
    return [previous, next];
  }

  if (next === undefined) {
    return previous;
  }

  return next;
}
