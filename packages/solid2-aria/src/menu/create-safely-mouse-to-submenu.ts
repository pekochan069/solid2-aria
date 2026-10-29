/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/menu/useSafelyMouseToSubmenu.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

import { createInteractionModality } from "../interactions/create-focus-visible";
import { createResizeObserver } from "../utils/create-resize-observer";
import { requireHTMLElement } from "../utils/dom-value";
import { nodeContains } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

interface SafelyMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: Accessor<Element | null>;
  /** Ref for the submenu. */
  submenuRef: Accessor<Element | null>;
  /** Whether the submenu is open. */
  isOpen: boolean;
  /** Whether this feature is disabled. */
  isDisabled?: boolean;
}

const ALLOWED_INVALID_MOVEMENTS = 2;
const THROTTLE_TIME = 50;
const TIMEOUT_TIME = 1000;

// 15°
const ANGLE_PADDING = Math.PI / 12;

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves
 * the trigger element. Prevents pointer events from going to the underlying menu if the user is
 * moving their pointer towards the sub-menu.
 */
export function createSafelyMouseToSubmenu(
  options: SafelyMouseToSubmenuOptions
): void {
  const _result0 = options;

  let prevPointerPos:
    | {
        x: number;
        y: number;
      }
    | undefined = undefined;

  let submenuRect: DOMRect | undefined = undefined;
  let lastProcessedTime = 0;

  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  let autoCloseTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  let submenuSide: "left" | "right" | undefined = undefined;
  let movementsTowardsSubmenuCount = 2;

  const [preventPointerEvents, setPreventPointerEvents] = createSignal(false, {
    ownedWrite: true,
  });

  const updateSubmenuRect = () => {
    const result0submenuRefElement = _result0.submenuRef();

    if (result0submenuRefElement) {
      submenuRect = result0submenuRefElement.getBoundingClientRect();
      submenuSide = undefined;
    }
  };

  createResizeObserver({
    get onResize() {
      return updateSubmenuRect;
    },
    get ref() {
      return _result0.isOpen ? _result0.submenuRef : undefined;
    },
  });

  const reset = () => {
    setPreventPointerEvents(false);
    movementsTowardsSubmenuCount = ALLOWED_INVALID_MOVEMENTS;
    prevPointerPos = undefined;
  };

  const modality = createInteractionModality();

  // Prevent mouse down over safe triangle. Clicking while pointer-events: none is applied
  // will cause focus to move unexpectedly since it will go to an element behind the menu.
  const onPointerDown = (e: PointerEvent) => {
    if (preventPointerEvents()) {
      e.preventDefault();
    }
  };

  createEffect(
    () => ({
      menuElement: _result0.menuRef(),
      preventPointerEvents: preventPointerEvents(),
    }),
    ({ menuElement, preventPointerEvents: currentPreventPointerEvents }) => {
      if (currentPreventPointerEvents && menuElement) {
        requireHTMLElement(menuElement).style.pointerEvents = "none";
      } else {
        requireHTMLElement(menuElement).style.pointerEvents = "";
      }
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({
      input4: setPreventPointerEvents,
      isDisabled: _result0.isDisabled,
      isOpen: _result0.isOpen,
      menuElement: _result0.menuRef(),
      modality: modality(),
      submenuElement: _result0.submenuRef(),
    }),
    ({
      modality: currentModality,
      isOpen,
      isDisabled,
      menuElement,
      submenuElement,
    }): undefined | (() => void) => {
      const submenu = submenuElement;
      const menu = menuElement;

      if (
        isTruthy(isDisabled) ||
        !submenu ||
        !isOpen ||
        currentModality !== "pointer" ||
        !menu
      ) {
        reset();

        return undefined;
      }

      submenuRect = submenu.getBoundingClientRect();

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          return;
        }

        const currentTime = Date.now();

        // Throttle
        if (currentTime - lastProcessedTime < THROTTLE_TIME) {
          return;
        }

        clearTimeout(timeout);
        clearTimeout(autoCloseTimeout);
        const { clientX: mouseX, clientY: mouseY } = e;

        if (!prevPointerPos) {
          prevPointerPos = { x: mouseX, y: mouseY };

          return;
        }

        if (!submenuRect) {
          return;
        }

        submenuSide ??= mouseX > submenuRect.right ? "left" : "right";

        // Pointer is outside of parent menu
        if (
          mouseX < menu.getBoundingClientRect().left ||
          mouseX > menu.getBoundingClientRect().right ||
          mouseY < menu.getBoundingClientRect().top ||
          mouseY > menu.getBoundingClientRect().bottom
        ) {
          reset();

          return;
        }

        /* Check if pointer is moving towards submenu.
              Uses the 2-argument arctangent (https://en.wikipedia.org/wiki/Atan2) to calculate:
                - angle between previous pointer and top of submenu
                - angle between previous pointer and bottom of submenu
                - angle between previous pointer and current pointer (delta)
              If the pointer delta angle value is between the top and bottom angle values, we know the pointer is moving towards the submenu.
            */
        const prevMouseX = prevPointerPos.x;
        const prevMouseY = prevPointerPos.y;

        const toSubmenuX =
          submenuSide === "right"
            ? submenuRect.left - prevMouseX
            : prevMouseX - submenuRect.right;

        const angleTop =
          Math.atan2(prevMouseY - submenuRect.top, toSubmenuX) + ANGLE_PADDING;

        const angleBottom =
          Math.atan2(prevMouseY - submenuRect.bottom, toSubmenuX) -
          ANGLE_PADDING;

        const anglePointer = Math.atan2(
          prevMouseY - mouseY,
          submenuSide === "left" ? -(mouseX - prevMouseX) : mouseX - prevMouseX
        );

        const isMovingTowardsSubmenu =
          anglePointer < angleTop && anglePointer > angleBottom;

        movementsTowardsSubmenuCount = isMovingTowardsSubmenu
          ? Math.min(
              movementsTowardsSubmenuCount + 1,
              ALLOWED_INVALID_MOVEMENTS
            )
          : Math.max(movementsTowardsSubmenuCount - 1, 0);

        if (movementsTowardsSubmenuCount >= ALLOWED_INVALID_MOVEMENTS) {
          setPreventPointerEvents(true);
        } else {
          setPreventPointerEvents(false);
        }

        lastProcessedTime = currentTime;
        prevPointerPos = { x: mouseX, y: mouseY };

        // If the pointer is moving towards the submenu, start a timeout to close if no other movements are made after 500ms.
        if (isMovingTowardsSubmenu) {
          timeout = setTimeout(() => {
            reset();
            autoCloseTimeout = setTimeout(() => {
              // Fire a pointerover event to trigger the menu to close.
              // Wait until pointer-events:none is no longer applied
              const target = document.elementFromPoint(mouseX, mouseY);

              if (target && nodeContains(menu, target)) {
                target.dispatchEvent(
                  new PointerEvent("pointerover", {
                    bubbles: true,
                    cancelable: true,
                  })
                );
              }
            }, 100);
          }, TIMEOUT_TIME);
        }
      };

      window.addEventListener("pointermove", onPointerMove);

      // Prevent pointer down over the safe triangle. See above comment.
      // Do not enable in tests, because JSDom doesn't do hit testing.
      if (process.env.NODE_ENV !== "test") {
        window.addEventListener("pointerdown", onPointerDown, true);
      }

      return () => {
        window.removeEventListener("pointermove", onPointerMove);

        if (process.env.NODE_ENV !== "test") {
          window.removeEventListener("pointerdown", onPointerDown, true);
        }

        clearTimeout(timeout);
        clearTimeout(autoCloseTimeout);
        movementsTowardsSubmenuCount = ALLOWED_INVALID_MOVEMENTS;
      };
    },
    { ssrSource: "client" }
  );
}
