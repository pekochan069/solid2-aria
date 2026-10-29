/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Separator.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { CollectionNode } from "@solid2-aria/core/collections/base-collection";
import type { BaseCollection } from "@solid2-aria/core/collections/base-collection";
import { createLeafComponent } from "@solid2-aria/core/collections/collection-builder";
import { createSeparator } from "@solid2-aria/core/separator/create-separator";
import type { SeparatorProps as AriaSeparatorProps } from "@solid2-aria/core/separator/create-separator";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext } from "solid-js";

import { assignRef, dom, createContextProps } from "./utils";
import type {
  ContextValue,
  Ref,
  StyleProps,
  SlotProps,
  DOMRenderProps,
} from "./utils";

export interface SeparatorProps
  extends
    AriaSeparatorProps,
    StyleProps,
    SlotProps,
    DOMRenderProps<"hr" | "div", undefined> {
  ref?: Ref<HTMLElement>;
}

export const SeparatorContext = createContext<
  ContextValue<SeparatorProps, HTMLElement>
>({});

export class SeparatorNode extends CollectionNode<unknown> {
  static override readonly type = "separator";
  override filter(
    collection: BaseCollection<unknown>,
    next: BaseCollection<unknown>
  ): this | null {
    const prev = this.prevKey === null ? null : next.getItem(this.prevKey);

    if (!prev || prev.type === "separator") {
      return null;
    }

    const clone = this.clone();
    next.addDescendants(clone, collection);

    return clone;
  }
}

const SeparatorComponent = createLeafComponent<SeparatorProps, HTMLElement>(
  SeparatorNode,
  (input: SeparatorProps): JSX.Element => {
    const [props, , setRef] = createContextProps(
      input,
      untrack(() => input.ref),
      SeparatorContext
    );

    const aria = createSeparator(props);

    const Element = dynamic(
      () =>
        dom[
          props.elementType === "div" || props.orientation === "vertical"
            ? "div"
            : "hr"
        ]
    );

    return (
      <Element
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          merge(() => aria.separatorProps ?? {})
        )}
        class={props.class ?? "solid2-aria-Separator"}
        style={props.style}
        render={props.render}
        ref={(element: HTMLElement) => {
          setRef(element);
        }}
        slot={props.slot ?? undefined}
      />
    );
  }
);

export function Separator(props: SeparatorProps): JSX.Element {
  return (
    <SeparatorComponent
      {...props}
      ref={(element: HTMLElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}
