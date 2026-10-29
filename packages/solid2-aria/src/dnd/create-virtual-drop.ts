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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useVirtualDrop.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { merge } from "solid-js";

import intlMessages from "../../intl/dnd/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createDescription } from "../utils/create-description";
import { noop } from "../utils/noop";
import * as DragManager from "./drag-manager";
import { createDragModality } from "./utils";

interface VirtualDropResult {
  dropProps: {
    readonly "aria-describedby"?: string;
    readonly onClick?: () => void;
  };
}

const MESSAGES = {
  keyboard: "dropDescriptionKeyboard",
  touch: "dropDescriptionTouch",
  virtual: "dropDescriptionVirtual",
} as const;

export function createVirtualDrop(): VirtualDropResult {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/dnd"
  );

  const modality = createDragModality();
  const dragSession = DragManager.createDragSession();

  const descriptionProps = createDescription(() =>
    dragSession() ? stringFormatter.format(MESSAGES[modality()]) : ""
  );

  return {
    get dropProps() {
      // unless there is an onclick handler bound directly to the element itself. By adding this
      // handler, React will take care of adding that for us, and we are able to handle document
      return merge(descriptionProps, {
        // Mobile Safari does not properly bubble click events on elements except links or inputs
        // level click events in the DragManager.
        // See https://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
        get onClick() {
          return noop;
        },
      });
    },
  };
}
