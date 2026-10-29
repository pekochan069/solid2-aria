/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/collections/Hidden.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { untrack, createContext, useContext } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { Ref } from "../types";

export const HiddenContext = createContext(false);

export function Hidden(props: { children?: SolidElement }): SolidElement {
  const hidden = useContext(HiddenContext);

  return (
    <>
      {hidden ? (
        props.children
      ) : (
        <template>
          <HiddenContext value={true}>{props.children}</HiddenContext>
        </template>
      )}
    </>
  );
}

export function createHideableComponent<T, P = object>(
  render: (props: P, ref?: Ref<T>) => SolidElement
): (props: P & { ref?: Ref<T> }) => SolidElement {
  return (props) =>
    useContext(HiddenContext)
      ? null
      : render(
          props,
          untrack(() => props.ref)
        );
}

export function createIsHidden(): boolean {
  return useContext(HiddenContext);
}
