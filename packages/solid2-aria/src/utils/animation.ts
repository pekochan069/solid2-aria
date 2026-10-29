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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/animation.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  createEffect,
  createMemo,
  createSignal,
  flush,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import { chain } from "./chain";
import { setStyle } from "./dom-helpers";
import { finishAnimations } from "./finish-animations";

type ReactiveBoolean = boolean | Accessor<boolean>;

type AnimationStart = (element: HTMLElement) => void | Promise<void>;

const readBoolean = (value: ReactiveBoolean) =>
  typeof value === "function" ? value() : value;

export function createEnterAnimation(
  ref: Accessor<HTMLElement | null>,
  isReady: ReactiveBoolean = true,
  onEnter?: AnimationStart
): Accessor<boolean> {
  const [isEntering, setEntering] = createSignal(true, { ownedWrite: true });
  const ready = () => readBoolean(isReady);
  const isAnimationReady = createMemo(() => isEntering() && ready());

  createEffect(
    () => ({ element: ref(), ready: ready() }),
    ({ element, ready: prepared }): undefined | (() => void) => {
      if (!prepared && element) {
        return chain(
          setStyle(element, "opacity", "0"),
          setStyle(element, "clip", "rect(0 0 0 0)"),
          setStyle(element, "clip-path", "inset(50%)"),
          setStyle(element, "mask-image", "linear-gradient(#0000, #0000)")
        );
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ element: ref(), ready: isAnimationReady() }),
    ({ element, ready: prepared }) => {
      if (prepared && element && "getAnimations" in element) {
        for (const animation of element.getAnimations()) {
          if (
            typeof CSSTransition !== "undefined" &&
            animation instanceof CSSTransition
          ) {
            animation.cancel();
          }
        }
      }
    },
    { ssrSource: "client" }
  );
  createAnimation(ref, isAnimationReady, onEnter, () => {
    setEntering(false);
  });

  return isAnimationReady;
}

export function createExitAnimation(
  ref: Accessor<HTMLElement | null>,
  isOpen: ReactiveBoolean,
  onExit?: AnimationStart
): Accessor<boolean> {
  const open = () => readBoolean(isOpen);

  const [exitState, setExitState] = createSignal<"closed" | "open" | "exiting">(
    untrack(open) ? "open" : "closed",
    { ownedWrite: true }
  );

  createEffect(
    open,
    (opened) => {
      setExitState((previous) => {
        if (opened) {
          return "open";
        }

        return previous === "open" ? "exiting" : previous;
      });
    },
    { ssrSource: "client" }
  );
  const isExiting = createMemo(() => !open() && exitState() !== "closed");
  createAnimation(ref, isExiting, onExit, () => {
    setExitState((previous) => (previous === "exiting" ? "closed" : previous));
  });

  return isExiting;
}

function createAnimation(
  ref: Accessor<HTMLElement | null>,
  isActive: Accessor<boolean>,
  onStart: AnimationStart | undefined,
  onEnd: () => void
): void {
  createEffect(
    () => ({ active: isActive(), element: ref() }),
    ({ active, element }): undefined | (() => void) => {
      if (!active || !element) {
        return undefined;
      }

      if (!("getAnimations" in element)) {
        onEnd();

        return undefined;
      }

      const startPromise = untrack((): ReturnType<AnimationStart> =>
        onStart?.(element)
      );

      const animations = element
        .getAnimations()
        .filter(
          (animation) =>
            (typeof DocumentTimeline === "undefined" ||
              animation.timeline instanceof DocumentTimeline) &&
            animation.playState === "running"
        );

      if (animations.length === 0 && !startPromise) {
        onEnd();

        return undefined;
      }

      let current = true;
      void finishAnimations(
        animations,
        () => {
          if (current) {
            onEnd();
            flush();
          }
        },
        startPromise
      );

      return () => {
        current = false;
      };
    },
    { ssrSource: "client" }
  );
}
