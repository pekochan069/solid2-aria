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
 * Derived from Adobe React Spectrum: packages/react-aria/src/label/useLabel.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  DOMProps,
  LabelableProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createEffect } from "solid-js";

import type { ElementType } from "../types";
import { createId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { isTruthy } from "../utils/truthy";

export interface LabelAriaProps
  extends LabelableProps, DOMProps, AriaLabelingProps {
  /**
   * The HTML element used to render the label, e.g. 'label', or 'span'.
   *
   * @default 'label'
   */
  labelElementType?: ElementType;
}

export interface LabelAria {
  /** Props to apply to the label container element. */
  labelProps: DOMAttributes & { for?: string };
  /** Props to apply to the field container element being labeled. */
  fieldProps: AriaLabelingProps & DOMProps;
}

/**
 * Provides the accessibility implementation for labels and their associated elements.
 * Labels provide context for user inputs.
 *
 * @param props - The props for labels and fields.
 */
export function createLabel(props: LabelAriaProps): LabelAria {
  const id = createId(() => props.id);
  const labelId = createId();

  const fieldProps = createLabels({
    get "aria-label"() {
      return props["aria-label"];
    },
    get "aria-labelledby"() {
      const references = props["aria-labelledby"];

      if (isTruthy(props.label)) {
        if (isTruthy(references)) {
          return `${labelId()} ${references}`;
        }

        return labelId();
      }

      return references;
    },
    get id() {
      return id();
    },
  });

  const labelProps: DOMAttributes & { for?: string } = {
    get for() {
      return (props.labelElementType ?? "label") === "label" ? id() : undefined;
    },
    get id() {
      return labelId();
    },
  };

  createEffect(
    () => ({
      ariaLabel: props["aria-label"],
      ariaLabelledby: props["aria-labelledby"],
      label: props.label,
    }),
    ({ ariaLabel, ariaLabelledby, label }) => {
      if (
        !isTruthy(label) &&
        !isTruthy(ariaLabelledby) &&
        !isTruthy(ariaLabel) &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
        );
      }
    },
    { ssrSource: "client" }
  );

  return {
    get fieldProps() {
      return fieldProps;
    },
    get labelProps() {
      return isTruthy(props.label) ? labelProps : {};
    },
  };
}
