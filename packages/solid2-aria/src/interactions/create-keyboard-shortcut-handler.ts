/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/createKeyboardShortcutHandler.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { KeyboardEvent } from "@solid2-aria/types-shared";

import { isMac } from "../utils/platform";
import { isTruthy } from "../utils/truthy";

interface KeyboardShortcutBehavior {
  shouldContinuePropagation?: boolean;
  shouldPreventDefault?: boolean;
}

// oxlint-disable-next-line typescript/no-invalid-void-type -- A handler may return normally or supply explicit shortcut behavior.
type ShortcutResult = void | boolean | KeyboardShortcutBehavior;

export type KeyboardShortcutAction = (e: KeyboardEvent) => ShortcutResult;

/** Maps shortcut strings (e.g. `"Mod+s"`, `"Control+Shift+a"`) to handlers. */
export type KeyboardShortcutBindings = Record<string, KeyboardShortcutAction>;

/** Modifier names in shortcut strings (case-insensitive). Order in the string does not matter. */

/** Canonical modifier order for stable keys (sorted, fixed order). */
const CANONICAL_MODIFIER_ORDER = ["Alt", "Control", "Meta", "Shift"] as const;

export interface ParsedKeyboardShortcut {
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  /**
   * Platform primary: Cmd on Mac, Control on Windows/Linux — expands to Meta or Control in
   * canonical form.
   */
  mod: boolean;
  key: string;
}

/**
 * Builds the set of canonical modifier tokens for a binding.
 * `Mod` contributes Meta (Mac) or Ctrl (non-Mac); explicit Ctrl/Meta add those keys too.
 */
export function modifierSetFromParsed(
  parsed: ParsedKeyboardShortcut
): Set<string> {
  const set = new Set<string>();

  if (parsed.alt) {
    set.add("Alt");
  }

  if (parsed.shift) {
    set.add("Shift");
  }

  if (parsed.ctrl) {
    set.add("Control");
  }

  if (parsed.meta) {
    set.add("Meta");
  }

  if (parsed.mod) {
    set.add(isMac() ? "Meta" : "Control");
  }

  return set;
}

/** Modifier set from a keydown event (native flags only). */
export function modifierSetFromEvent(e: KeyboardEvent): Set<string> {
  const set = new Set<string>();

  if (e.altKey) {
    set.add("Alt");
  }

  if (e.ctrlKey) {
    set.add("Control");
  }

  if (e.metaKey) {
    set.add("Meta");
  }

  if (e.shiftKey) {
    set.add("Shift");
  }

  return set;
}

function sortedModifierTokens(set: Set<string>): string[] {
  return CANONICAL_MODIFIER_ORDER.filter((name) => set.has(name));
}

/**
 * Parses a shortcut like `"Mod+Shift+z"`, `"Ctrl+Alt+Enter"`, or `"Escape"`.
 * Modifiers are case-insensitive; order does not matter. `control` is an alias for `ctrl`.
 */
export function parseKeyboardShortcut(spec: string): ParsedKeyboardShortcut {
  const parts: ParsedKeyboardShortcut = {
    alt: false,
    ctrl: false,
    key: "",
    meta: false,
    mod: false,
    shift: false,
  };

  for (const part of spec.split("+")) {
    const lower = part.toLowerCase();

    switch (lower) {
      case "shift": {
        parts.shift = true;
        break;
      }

      case "alt": {
        parts.alt = true;
        break;
      }

      case "control": {
        parts.ctrl = true;
        break;
      }

      case "meta": {
        parts.meta = true;
        break;
      }

      case "mod": {
        parts.mod = true;
        break;
      }

      default: {
        parts.key = part;
      }
    }
  }

  if (parts.key === "") {
    throw new Error(
      `Invalid keyboard shortcut: "${spec}". Must include exactly one non-modifier key (e.g. "a", "Enter", "ArrowDown"). Combine any of Shift, Alt, Ctrl, Meta, and Mod.`
    );
  }

  return parts;
}

function normalizeEventKey(key: string): string {
  return key.toLowerCase();
}

/** Short aliases for common keys (shortcut side, before match). */
const KEY_ALIASES = new Map<string, string>([
  ["del", "delete"],
  ["down", "arrowdown"],
  ["esc", "escape"],
  ["ins", "insert"],
  ["left", "arrowleft"],
  ["pagedown", "pagedown"],
  ["pageup", "pageup"],
  ["right", "arrowright"],
  ["space", " "],
  ["up", "arrowup"],
]);

/** Canonical key segment (lowercase); aliases like `down` → `arrowdown`. */
function canonicalKeyFromSpecKey(specKey: string): string {
  const k = normalizeEventKey(specKey);
  const aliased = KEY_ALIASES.get(k);

  return aliased ?? k;
}

/** Canonical shortcut string for a binding (modifiers sorted: Alt, Ctrl, Meta, Shift, then key). */
export function canonicalKeyboardShortcut(
  parsed: ParsedKeyboardShortcut
): string {
  const mods = sortedModifierTokens(modifierSetFromParsed(parsed));
  const key = canonicalKeyFromSpecKey(parsed.key);

  return mods.length > 0 ? `${mods.join("+")}+${key}` : key;
}

/** Canonical shortcut string for a keydown event. */
export function keyboardEventToCanonicalShortcut(e: KeyboardEvent): string {
  const mods = sortedModifierTokens(modifierSetFromEvent(e));
  const key = normalizeEventKey(e.key);
  const prefix = mods.length > 0 ? `${mods.join("+")}+` : "";

  return prefix + key;
}

/**
 * Returns a keydown handler that runs the action only for an exact modifier+key match.
 * Modifier order in the string does not matter (`Shift+Mod+a` ≡ `Mod+Shift+a`).
 * Any combination of **Shift**, **Alt**, **Ctrl**, **Meta**, and **Mod** is allowed; **Mod** means
 * Cmd on Apple platforms and Ctrl on Windows/Linux (same as before). **control** aliases **ctrl**.
 *
 * Duplicate bindings that normalize to the same shortcut: later object entries win.
 *
 * @example
 *   ```tsx
 *   let onKeyDown = createKeyboardShortcutHandler({
 *     'Mod+s': e => {
 *       e.preventDefault();
 *       save();
 *     },
 *     'Ctrl+Shift+k': () => palette(),
 *     'Meta+Alt+ArrowLeft': () => back()
 *   });
 *   ```;
 */
export function createKeyboardShortcutHandler(
  bindings: KeyboardShortcutBindings
): (e: KeyboardEvent) => void {
  const map = new Map<string, KeyboardShortcutAction>();

  for (const [spec, action] of Object.entries(bindings)) {
    const parsed = parseKeyboardShortcut(spec);
    map.set(canonicalKeyboardShortcut(parsed), action);
  }

  return (e: KeyboardEvent) => {
    const canonical = keyboardEventToCanonicalShortcut(e);
    const action = map.get(canonical);
    let result = action?.(e);

    if (result === undefined && action !== undefined) {
      result = { shouldContinuePropagation: false, shouldPreventDefault: true };
    } else if (typeof result === "boolean") {
      result = {
        shouldContinuePropagation: !result,
        shouldPreventDefault: result,
      };
    }

    if (isTruthy(result?.shouldPreventDefault)) {
      e.preventDefault();
    }

    if (!action || isTruthy(result?.shouldContinuePropagation)) {
      e.continuePropagation();
    }
  };
}
