/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/typeHelpers.ts.
 * Modified for Solid Aria: adapted type guard narrowing and formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

/**
 * Type guard that checks if a value is a Node. Verifies the presence and type of the nodeType
 * property.
 */
export function isNode<T>(value: T): value is T & Node {
  return (
    value !== null &&
    typeof value === "object" &&
    "nodeType" in value &&
    typeof value.nodeType === "number"
  );
}

/**
 * Type guard that checks if a value is a Window. Uses window self reference checks to
 * distinguish Window from other values.
 */
export function isWindow<T>(value: T): value is T & Window & typeof globalThis {
  return (
    typeof value === "object" &&
    value !== null &&
    value !== undefined &&
    "window" in value &&
    value.window === value
  );
}

/**
 * Type guard that checks if a value is a Document. Uses nodeType and host property checks to
 * distinguish Document from other values.
 */
export function isDocument<T>(value: T): value is T & Document {
  return isNode(value) && value.nodeType === 9;
}

/**
 * Type guard that checks if a value is a ShadowRoot. Uses nodeType and host property checks to
 * distinguish ShadowRoot from other values.
 */
export function isShadowRoot<T>(value: T): value is T & ShadowRoot {
  // 11 = DOCUMENT_FRAGMENT_NODE
  return isNode(value) && value.nodeType === 11 && "host" in value;
}

/**
 * Type guard that checks if a value is an Element. Uses nodeType checks to distinguish Element
 * from other values.
 */
export function isElement(value: unknown): value is Element {
  // 1 = ELEMENT_NODE
  return isNode(value) && value.nodeType === 1;
}
