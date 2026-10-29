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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorSlider.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ColorSliderProps,
  ColorSliderState,
} from "@solid2-aria/stately/color/create-color-slider-state";
import type {
  AriaLabelingProps,
  DOMProps,
  InputDOMProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createSlider } from "../slider/create-slider";
import type { SliderAria } from "../slider/create-slider";
import { createSliderThumb } from "../slider/create-slider-thumb";
import type { InputHTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { createVisuallyHidden } from "../visually-hidden/visually-hidden";

export interface AriaColorSliderProps
  extends ColorSliderProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface AriaColorSliderOptions extends AriaColorSliderProps {
  /** A ref for the track element. */
  trackRef: Accessor<Element | null>;
  /** A ref for the input element. */
  inputRef: Accessor<HTMLInputElement | null>;
}

export interface ColorSliderAria {
  /** Props for the label element. */
  labelProps: SliderAria["labelProps"];
  /** Props for the track element. */
  trackProps: DOMAttributes;
  /** Props for the thumb element. */
  thumbProps: DOMAttributes;
  /** Props for the visually hidden range input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the output element, displaying the value of the color slider. */
  outputProps: SliderAria["outputProps"];
}

/**
 * Provides the behavior and accessibility implementation for a color slider component.
 * Color sliders allow users to adjust an individual channel of a color value.
 */
export function createColorSlider(
  props: AriaColorSliderOptions,
  state: ColorSliderState
): ColorSliderAria {
  const _result0 = createLocale();

  const ariaLabel = createMemo(
    () =>
      getTruthyValue(props["aria-label"]) ??
      (!isTruthy(props.label) && !isTruthy(props["aria-labelledby"])
        ? state.value.getChannelName(props.channel, _result0.locale)
        : undefined)
  );

  const _result1 = createSlider(
    merge(omit(props, "value", "defaultValue", "onChange", "onChangeEnd"), {
      get "aria-label"() {
        return ariaValue(ariaValue(ariaLabel()));
      },
    }),
    state,
    props.trackRef
  );

  const _result2 = createSliderThumb(
    {
      get form() {
        return props.form;
      },
      get index(): 0 {
        return 0;
      },
      get inputRef() {
        return props.inputRef;
      },
      get isDisabled() {
        return props.isDisabled;
      },
      get name() {
        return props.name;
      },
      // oxlint-disable-next-line typescript/no-deprecated -- Forward the supported legacy orientation option to the slider adapter.
      get orientation() {
        return getLegacyOption(props, "orientation");
      },
      get trackRef() {
        return props.trackRef;
      },
    },
    state
  );

  const value = createMemo(() => state.getDisplayColor());

  const generateBackground = () => {
    let to: string;

    if (props.orientation === "vertical") {
      to = "top";
    } else if (_result0.direction === "ltr") {
      to = "right";
    } else {
      to = "left";
    }

    switch (props.channel) {
      case "hue": {
        const stops = [0, 60, 120, 180, 240, 300, 360]
          .map((hue) => value().withChannelValue("hue", hue).toString("css"))
          .join(", ");

        return `linear-gradient(to ${to}, ${stops})`;
      }

      case "lightness": {
        // We have to add an extra color stop in the middle so that the hue shows up at all.
        // Otherwise it will always just be black to white.
        const min = state.getThumbMinValue(0);
        const max = state.getThumbMaxValue(0);

        const start = value()
          .withChannelValue(props.channel, min)
          .toString("css");

        const middle = value()
          .withChannelValue(props.channel, (max - min) / 2)
          .toString("css");

        const end = value()
          .withChannelValue(props.channel, max)
          .toString("css");

        return `linear-gradient(to ${to}, ${start}, ${middle}, ${end})`;
      }

      case "saturation":
      case "brightness":
      case "red":
      case "green":
      case "blue":
      case "alpha": {
        const start = value()
          .withChannelValue(props.channel, state.getThumbMinValue(0))
          .toString("css");

        const end = value()
          .withChannelValue(props.channel, state.getThumbMaxValue(0))
          .toString("css");

        return `linear-gradient(to ${to}, ${start}, ${end})`;
      }

      default: {
        throw new Error(`Unknown color channel: ${String(props.channel)}`);
      }
    }
  };

  const forcedColorAdjustNoneStyle = { "forced-color-adjust": "none" } as const;

  const _result3 = createVisuallyHidden({
    get style() {
      return {
        get height(): "100%" {
          return "100%" as const;
        },
        get opacity(): "0.0001" {
          return "0.0001" as const;
        },
        get "pointer-events"(): "none" {
          return "none" as const;
        },
        get width(): "100%" {
          return "100%" as const;
        },
      };
    },
  });

  return {
    get inputProps() {
      return merge(_result2.inputProps, {
        get "aria-valuetext"() {
          const base = _result2.inputProps["aria-valuetext"];

          let name: string;

          if (props.channel === "hue") {
            name = value().getHueName(_result0.locale);
          } else if (props.channel === "alpha") {
            name = "";
          } else {
            name = value().getColorName(_result0.locale);
          }

          return isTruthy(name) ? `${base}, ${name}` : base;
        },
        get style() {
          return merge(
            _result2.inputProps.style,
            _result3.visuallyHiddenProps.style
          );
        },
      });
    },
    get labelProps() {
      return _result1.labelProps;
    },
    get outputProps() {
      return _result1.outputProps;
    },
    get thumbProps() {
      return merge(_result2.thumbProps, {
        get style() {
          return merge(_result2.thumbProps.style, forcedColorAdjustNoneStyle);
        },
      });
    },
    get trackProps() {
      return merge(mergeProps(_result1.groupProps, _result1.trackProps), {
        get style() {
          return merge(_result1.trackProps.style, forcedColorAdjustNoneStyle, {
            get background() {
              return generateBackground();
            },
          });
        },
      });
    },
  };
}
