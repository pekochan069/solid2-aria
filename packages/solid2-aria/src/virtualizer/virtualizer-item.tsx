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
 * Derived from Adobe React Spectrum: packages/react-aria/src/virtualizer/VirtualizerItem.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LayoutInfo } from "@solid2-aria/stately/virtualizer/layout-info";
import type { Direction } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import type { CSSProperties } from "../types";
import { isTruthy } from "../utils/truthy";
import { createVirtualizerItem } from "./create-virtualizer-item";
import type { VirtualizerItemOptions } from "./create-virtualizer-item";

interface VirtualizerItemProps extends Omit<VirtualizerItemOptions, "ref"> {
  layoutInfo: LayoutInfo;
  parent?: LayoutInfo | null;
  style?: CSSProperties;
  class?: string;
  children: SolidElement;
  shouldObserveItemSize?: boolean;
}

export function VirtualizerItem(props: VirtualizerItemProps): JSX.Element {
  const locale = createLocale();

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  createVirtualizerItem({
    get layoutInfo() {
      return props.layoutInfo;
    },
    ref,
    get shouldObserveItemSize() {
      return props.shouldObserveItemSize;
    },
    get virtualizer() {
      return props.virtualizer;
    },
  });

  return (
    <div
      role="presentation"
      ref={(node) => {
        setRef(node);
      }}
      class={props.class}
      style={{
        ...layoutInfoToStyle(props.layoutInfo, locale.direction, props.parent),
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

interface RectStyleCoordinates {
  [coordinate: string]: number | undefined;
}

const cache = new WeakMap<LayoutInfo, CSSProperties>();

export function layoutInfoToStyle(
  layoutInfo: LayoutInfo,
  dir: Direction,
  parent?: LayoutInfo | null
): CSSProperties {
  const xProperty = dir === "rtl" ? "right" : "left";
  const cached = cache.get(layoutInfo);

  if (
    isTruthy(cached) &&
    cached[xProperty] !== null &&
    cached[xProperty] !== undefined
  ) {
    if (!parent) {
      return cached;
    }

    // Invalidate if the parent position changed.
    const top = layoutInfo.rect.y - parent.rect.y;
    const x = layoutInfo.rect.x - parent.rect.x;

    if (cached.top === `${top}px` && cached[xProperty] === `${x}px`) {
      return cached;
    }
  }

  const rectStyles: RectStyleCoordinates = {
    height: layoutInfo.rect.height,
    // Follow-up: For layoutInfos that are sticky that have parents with overflow visible, their "top" will be relative to the to the nearest scrolling container
    // which WON'T be the parent since the parent has overflow visible. This means we shouldn't offset the height by the parent's position
    // Not 100% about this change here since it is quite ambigious what the scrolling container maybe and how its top is positioned with respect to the
    // calculated layoutInfo.y here
    top:
      layoutInfo.rect.y -
      (parent && (!parent.allowOverflow || !layoutInfo.isSticky)
        ? parent.rect.y
        : 0),
    width: layoutInfo.rect.width,
    [xProperty]:
      layoutInfo.rect.x -
      (parent && (!parent.allowOverflow || !layoutInfo.isSticky)
        ? parent.rect.x
        : 0),
  };

  // Get rid of any non finite values since they aren't valid css values
  for (const [key, value] of Object.entries(rectStyles)) {
    if (!Number.isFinite(value)) {
      rectStyles[key] = undefined;
    }
  }

  const style: CSSProperties = {
    contain: "size layout style",
    // Sticky elements are positioned in normal document flow. Display inline-block so that they don't push other sticky columns onto the following rows.
    display: layoutInfo.isSticky ? "inline-block" : undefined,
    opacity: layoutInfo.opacity,
    overflow: layoutInfo.allowOverflow ? "visible" : "hidden",
    position: layoutInfo.isSticky ? "sticky" : "absolute",
    transform: layoutInfo.transform ?? undefined,
    "z-index": layoutInfo.zIndex,

    ...Object.fromEntries(
      Object.entries(rectStyles).map(([key, value]) => [
        key,
        value === undefined ? undefined : `${value}px`,
      ])
    ),
  };

  cache.set(layoutInfo, style);

  return style;
}
