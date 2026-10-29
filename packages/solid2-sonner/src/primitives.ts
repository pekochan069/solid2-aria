/*!
 * Derived from solid-sonner (https://github.com/wobsoriano/solid-sonner), src/primitives.ts.
 * Copyright (c) 2022 Robert Soriano <https://github.com/wobsoriano>
 * Modified for Solid Aria: Solid 2 types, reactivity, lifecycle, and package integration.
 * MIT licensed. See LICENSE, SOLID-SONNER-LICENSE.md, SONNER-LICENSE.md, and NOTICE.txt in the package root.
 */

import { createSignal, onSettled } from "solid-js";

export function createIsDocumentHidden() {
  const [isDocumentHidden, setIsDocumentHidden] = createSignal(
    globalThis.document?.hidden ?? false
  );

  const callback = () => {
    setIsDocumentHidden(document.hidden);
  };

  onSettled(() => {
    document.addEventListener("visibilitychange", callback);

    return () => {
      document.removeEventListener("visibilitychange", callback);
    };
  });

  return isDocumentHidden;
}
