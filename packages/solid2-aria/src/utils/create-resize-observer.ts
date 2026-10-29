/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useResizeObserver.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

interface ResizeObserverOptions<T> {
  ref: Accessor<T | undefined | null> | undefined;
  box?: ResizeObserverBoxOptions;
  onResize: () => void;
}

export function createResizeObserver<T extends Element>(
  options: ResizeObserverOptions<T>
): void {
  const onResize = () => {
    options.onResize();
  };

  createEffect(
    () => ({ box: options.box, element: options.ref?.() }),
    ({ box, element }): undefined | (() => void) => {
      if (!element) {
        return undefined;
      }

      if (window.ResizeObserver !== undefined) {
        const observer = new window.ResizeObserver((entries) => {
          if (entries.length > 0) {
            onResize();
          }
        });

        observer.observe(element, { box });

        return () => {
          observer.disconnect();
        };
      }

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
      };
    },
    { ssrSource: "client" }
  );
}
