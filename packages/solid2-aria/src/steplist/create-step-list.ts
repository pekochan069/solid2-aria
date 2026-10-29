/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/steplist/useStepList.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  StepListProps,
  StepListState,
} from "@solid2-aria/stately/steplist/create-step-list-state";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/steplist/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createSelectableList } from "../selection/create-selectable-list";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";

export interface AriaStepListProps<T>
  extends StepListProps<T>, AriaLabelingProps, DOMProps {}

export interface StepListAria {
  listProps: HTMLAttributes;
}

export function createStepList<T>(
  props: AriaStepListProps<T>,
  state: StepListState<T>,
  ref: Accessor<HTMLOListElement | null>
): StepListAria {
  const _result0 = props;

  const _result1 = createSelectableList(
    merge(props, state, {
      get allowsTabNavigation(): true {
        return true;
      },
      get ref() {
        return ref;
      },
    })
  );

  const strings = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/steplist"
  );

  const stepListProps = createMemo(() => ({
    ...mergeProps(
      _result1.listProps,
      filterDOMProps(props, { labelable: true })
    ),
    "aria-label": ariaValue(
      getTruthyValue(_result0["aria-label"]) ?? strings.format("steplist")
    ),
  }));

  return {
    get listProps() {
      return merge(stepListProps(), {
        tabindex: undefined,
      });
    },
  };
}
