/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorSwatch.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { parseColor } from "@solid2-aria/stately/color/color";
import type { Color } from "@solid2-aria/stately/color/types";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import { merge, createMemo } from "solid-js";

import intlMessages from "../../intl/color/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface AriaColorSwatchProps extends AriaLabelingProps, DOMProps {
  /** The color value to display in the swatch. */
  color?: string | Color;
  /**
   * A localized accessible name for the color.
   * By default, a description is generated from the color value,
   * but this can be overridden if you have a more specific color
   * name (e.g. Pantone colors).
   */
  colorName?: string;
}

export interface ColorSwatchAria {
  /** Props for the color swatch element. */
  colorSwatchProps: HTMLAttributes;
  /** The parsed color value of the swatch. */
  color: Color;
}

/**
 * Provides the accessibility implementation for a color swatch component.
 * A color swatch displays a preview of a selected color.
 */
export function createColorSwatch(
  props: AriaColorSwatchProps
): ColorSwatchAria {
  const color = createMemo(() => {
    const value = getTruthyValue(props.color) ?? "#fff0";

    return typeof value === "string" ? parseColor(value) : value;
  });

  const _result0 = createLocale();

  const DOMProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/color"
  );

  const id = createId(() => props.id);

  const colorName = createMemo(
    () =>
      getTruthyValue(props.colorName) ??
      (color().getChannelValue("alpha") === 0
        ? stringFormatter.format("transparent")
        : color().getColorName(_result0.locale))
  );

  return {
    get color() {
      return getTruthyValue(color()) ?? null;
    },
    get colorSwatchProps() {
      return merge(DOMProps(), {
        get "aria-label"() {
          return ariaValue(
            ariaValue(
              [colorName(), getTruthyValue(props["aria-label"]) ?? ""]
                .filter(Boolean)
                .join(", ")
            )
          );
        },
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(
              isTruthy(props["aria-labelledby"])
                ? `${id()} ${props["aria-labelledby"]}`
                : undefined
            )
          );
        },
        get "aria-roledescription"() {
          return ariaValue(ariaValue(stringFormatter.format("colorSwatch")));
        },
        get id() {
          return id();
        },
        get role(): "img" {
          return "img" as const;
        },
        get style() {
          return {
            get "background-color"() {
              return color().toString("css");
            },
            get "forced-color-adjust"(): "none" {
              return "none" as const;
            },
          };
        },
      });
    },
  };
}
