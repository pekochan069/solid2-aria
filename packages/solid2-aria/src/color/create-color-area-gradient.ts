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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorAreaGradient.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { parseColor } from "@solid2-aria/stately/color/color";
import type { ColorAreaState } from "@solid2-aria/stately/color/create-color-area-state";
import type { Color, ColorChannel } from "@solid2-aria/stately/color/types";
import { createMemo } from "solid-js";

import type { CSSProperties } from "../types";

const hue = (color: Color) =>
  [0, 60, 120, 180, 240, 300, 360]
    .map((hueValue) => color.withChannelValue("hue", hueValue).toString("css"))
    .join(", ");

const saturation = (color: Color) =>
  `${String(color.withChannelValue("saturation", 0))}, transparent`;

const hslChannels = {
  hue,
  lightness: () => "black, transparent, white",
  saturation,
};

const hsbChannels = {
  brightness: () => "black, transparent",
  hue,
  saturation,
};

interface Gradients {
  colorAreaStyleProps: {
    style: CSSProperties;
  };
  thumbStyleProps: {
    style: CSSProperties;
  };
}

interface ColorAreaGradientProps {
  direction: "ltr" | "rtl";
  state: ColorAreaState;
  zChannel: ColorChannel;
  xChannel: ColorChannel;
  yChannel: ColorChannel;
}

export function createColorAreaGradient(
  _props0: ColorAreaGradientProps
): Gradients {
  const returnVal = createMemo<Gradients>(() => {
    const end = _props0.direction === "rtl" ? "left" : "right";
    let colorAreaStyles = {};
    const zValue = _props0.state.value.getChannelValue(_props0.zChannel);

    switch (_props0.state.value.getColorSpace()) {
      case "rgb": {
        const rgb = parseColor("rgb(0, 0, 0)");
        colorAreaStyles = {
          background: [
            // The screen blend mode multiplies the inverse of each channel, e.g. 1 - (1 - a) * (1 - b).
            // Create a layer for each channel, with the other channels as 0. After blending, this should
            // result in the gradients being combined channel by channel.
            `linear-gradient(to ${end}, ${String(rgb.withChannelValue(_props0.xChannel, 0))}, ${String(rgb.withChannelValue(_props0.xChannel, 255))})`,
            `linear-gradient(to top, ${String(rgb.withChannelValue(_props0.yChannel, 0))}, ${String(rgb.withChannelValue(_props0.yChannel, 255))})`,
            rgb.withChannelValue(_props0.zChannel, zValue),
          ].join(","),
          "background-blend-mode": "screen",
        };
        break;
      }

      case "hsl": {
        const channels = _props0.state.value.getColorChannels();

        const value = parseColor("hsl(0, 100%, 50%)").withChannelValue(
          _props0.zChannel,
          zValue
        );

        const bg = channels
          .filter((c) => c !== _props0.zChannel)
          .map(
            (c) =>
              `linear-gradient(to ${c === _props0.xChannel ? end : "top"}, ${c === "hue" || c === "saturation" || c === "lightness" ? hslChannels[c](value) : ""})`
          )
          .toReversed();

        if (_props0.zChannel === "hue") {
          bg.push(value.toString("css"));
        }

        colorAreaStyles = {
          background: bg.join(", "),
        };
        break;
      }

      case "hsb": {
        const channels = _props0.state.value.getColorChannels();

        const value = parseColor("hsb(0, 100%, 100%)").withChannelValue(
          _props0.zChannel,
          zValue
        );

        const bg = channels
          .filter((c) => c !== _props0.zChannel)
          .map(
            (c) =>
              `linear-gradient(to ${c === _props0.xChannel ? end : "top"}, ${c === "hue" || c === "saturation" || c === "brightness" ? hsbChannels[c](value) : ""})`
          )
          .toReversed();

        if (_props0.zChannel === "hue") {
          bg.push(value.toString("css"));
        }

        colorAreaStyles = {
          background: bg.join(", "),
        };
        break;
      }

      default: {
        break;
      }
    }

    const destructured0 = _props0.state.getThumbPosition();
    let { x } = destructured0;
    const { y } = destructured0;

    if (_props0.direction === "rtl") {
      x = 1 - x;
    }

    const forcedColorAdjustNoneStyle = {
      "forced-color-adjust": "none",
    } as const;

    return {
      colorAreaStyleProps: {
        style: {
          position: "relative",
          "touch-action": "none",
          ...forcedColorAdjustNoneStyle,
          ...colorAreaStyles,
        },
      },
      thumbStyleProps: {
        style: {
          left: `${x * 100}%`,
          position: "absolute",
          top: `${y * 100}%`,
          "touch-action": "none",
          transform: "translate(-50%, -50%)",
          ...forcedColorAdjustNoneStyle,
        },
      },
    };
  });

  return {
    get colorAreaStyleProps() {
      return returnVal().colorAreaStyleProps;
    },
    get thumbStyleProps() {
      return returnVal().thumbStyleProps;
    },
  };
}
