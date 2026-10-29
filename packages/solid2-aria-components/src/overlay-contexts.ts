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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Dialog.tsx.
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Menu.tsx.
 * Modified for Solid Aria: share overlay contexts independently of component modules to avoid initialization cycles.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { RootMenuTriggerState } from "@solid2-aria/stately/menu/create-menu-trigger-state";
import type { OverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import { createContext } from "solid-js";

export const OverlayTriggerStateContext =
  createContext<OverlayTriggerState | null>(null);

export const RootMenuTriggerStateContext =
  createContext<RootMenuTriggerState | null>(null);
