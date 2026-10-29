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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/DragPreview.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DragItem, DragPreviewRenderer } from "@solid2-aria/types-shared";
import { createSignal, flush, onSettled, Show } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { isTruthy } from "../utils/truthy";

export interface DragPreviewProps {
  children: (
    items: DragItem[]
  ) => SolidElement | { element: SolidElement; x: number; y: number };
  ref?: (renderer: DragPreviewRenderer | null) => void;
}

export function DragPreview(props: DragPreviewProps): SolidElement {
  const [preview, setPreview] = createSignal<SolidElement>(null);
  let element: HTMLDivElement | undefined;
  let frame: number | undefined;

  const renderPreview: DragPreviewRenderer = (items, handle1) => {
    const result = props.children(items);

    const offset =
      isTruthy(result) && typeof result === "object" && "element" in result
        ? result
        : null;

    setPreview(() => (offset ? offset.element : result));
    flush();
    handle1(element ?? null, offset?.x, offset?.y);
    frame = requestAnimationFrame(() => {
      setPreview(null);
    });
  };

  onSettled(() => {
    if (typeof props.ref === "function") {
      props.ref(renderPreview);
    }

    return () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }

      if (typeof props.ref === "function") {
        props.ref(null);
      }
    };
  });

  return (
    <Show when={isTruthy(preview())}>
      <div
        style={{
          left: "-100000px",
          position: "fixed",
          top: 0,
          "z-index": -100,
        }}
        ref={(node) => {
          element = node;
        }}
      >
        {preview()}
      </div>
    </Show>
  );
}
