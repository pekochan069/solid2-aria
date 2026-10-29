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
 * Derived from Adobe React Spectrum: packages/@react-types/text/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMProps } from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface HeadingProps extends DOMProps, StyleProps {
  /**
   * Heading content.
   */
  children: JSX.Element;
  /**
   * A slot to place the heading in.
   *
   * @default 'heading'
   */
  slot?: string;
  /**
   * Sets heading level, h1 through h6.
   *
   * @default 3
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface TextProps extends DOMProps, StyleProps {
  /**
   * Text content.
   */
  children: JSX.Element;
  /**
   * A slot to place the text in.
   *
   * @default 'text'
   */
  slot?: string;
}

export interface KeyboardProps extends DOMProps, StyleProps {
  /**
   * Keyboard shortcut text.
   */
  children: JSX.Element;
  /**
   * A slot to place the keyboard shortcut in.
   *
   * @default 'keyboard'
   */
  slot?: string;
}
