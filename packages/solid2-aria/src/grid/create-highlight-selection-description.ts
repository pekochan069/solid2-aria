/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useHighlightSelectionDescription.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type { AriaLabelingProps } from "@solid2-aria/types-shared";
import { createMemo } from "solid-js";

import intlMessages from "../../intl/grid/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createInteractionModality } from "../interactions/create-focus-visible";
import { createDescription } from "../utils/create-description";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

export interface HighlightSelectionDescriptionProps {
  selectionManager: MultipleSelectionManager;
  hasItemActions?: boolean;
}

/**
 * Computes the description for a grid selectable collection.
 *
 * @param props - The selected item description options.
 */
export function createHighlightSelectionDescription(
  props: HighlightSelectionDescriptionProps
): AriaLabelingProps {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/grid"
  );

  const modality = createInteractionModality();

  // null is the default if the user hasn't interacted with the table at all yet or the rest of the page
  const shouldLongPress = createMemo(
    () =>
      (modality() === "pointer" ||
        modality() === "virtual" ||
        !isPresent(modality())) &&
      typeof window !== "undefined" &&
      "ontouchstart" in window
  );

  const interactionDescription = createMemo(() => {
    const { selectionMode } = props.selectionManager;
    const { selectionBehavior } = props.selectionManager;
    let message: string | undefined;

    if (shouldLongPress()) {
      message = stringFormatter.format("longPressToSelect");
    }

    return selectionBehavior === "replace" &&
      selectionMode !== "none" &&
      isTruthy(props.hasItemActions)
      ? message
      : undefined;
  });

  const descriptionProps = createDescription(() => interactionDescription());

  return descriptionProps;
}
