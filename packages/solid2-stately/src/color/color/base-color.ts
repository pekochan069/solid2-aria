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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/Color.ts.
 * Modified for Solid Aria: reorganized color code, type declarations, imports, and formatting.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { NumberFormatter } from "@internationalized/number";
import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
} from "@internationalized/string";

import intlMessages from "../../../intl/color";
import type {
  ColorAxes,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorSpace,
  Color as IColor,
} from "../types";
import { toOKLCH } from "./oklch";

const dictionary = new LocalizedStringDictionary<string>(intlMessages);

// Lightness threshold between orange and brown.
const ORANGE_LIGHTNESS_THRESHOLD = 0.68;

// Lightness threshold between pure yellow and "yellow green".
const YELLOW_GREEN_LIGHTNESS_THRESHOLD = 0.85;

// The maximum lightness considered to be "dark".
const MAX_DARK_LIGHTNESS = 0.55;

// The chroma threshold between gray and color.
const GRAY_THRESHOLD = 0.001;

const OKLCH_HUES: [number, string][] = [
  [0, "pink"],
  [15, "red"],
  [48, "orange"],
  [94, "yellow"],
  [135, "green"],
  [175, "cyan"],
  [264, "blue"],
  [284, "purple"],
  [320, "magenta"],
  [349, "pink"],
];

export abstract class Color implements IColor {
  private readonly dictionary = dictionary;
  abstract toFormat(format: ColorFormat): IColor;
  abstract toString(format?: ColorFormat | "css"): string;
  abstract clone(): IColor;
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange;
  abstract getChannelFormatOptions(
    channel: ColorChannel
  ): Intl.NumberFormatOptions;
  abstract formatChannelValue(channel: ColorChannel, locale: string): string;

  toHexInt(): number {
    return this.toFormat("rgb").toHexInt();
  }

  abstract getChannelValue(channel: ColorChannel): number;
  abstract withChannelValue(channel: ColorChannel, value: number): IColor;

  getChannelName = (channel: ColorChannel, locale: string) => {
    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage(
        "@react-stately/color"
      ) ?? this.dictionary;

    return strings.getStringForLocale(channel, locale);
  };

  abstract getColorSpace(): ColorSpace;

  getColorSpaceAxes(xyChannels: {
    xChannel?: ColorChannel;
    yChannel?: ColorChannel;
  }): ColorAxes {
    const { xChannel, yChannel } = xyChannels;

    const channels = this.getColorChannels();
    const xCh = xChannel ?? channels.find((channel) => channel !== yChannel);
    const yCh = yChannel ?? channels.find((channel) => channel !== xCh);
    const zCh = channels.find((channel) => channel !== xCh && channel !== yCh);

    if (xCh === undefined || yCh === undefined || zCh === undefined) {
      throw new Error("Unable to determine color space axes");
    }

    return { xChannel: xCh, yChannel: yCh, zChannel: zCh };
  }

  abstract getColorChannels(): [ColorChannel, ColorChannel, ColorChannel];

  getColorName(locale: string): string {
    // Convert to oklch color space, which has perceptually uniform lightness across all hues.
    const [initialLightness, c, h] = toOKLCH(this);
    let l = initialLightness;

    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage(
        "@react-stately/color"
      ) ?? this.dictionary;

    if (l > 0.999) {
      return strings.getStringForLocale("white", locale);
    }

    if (l < 0.001) {
      return strings.getStringForLocale("black", locale);
    }

    const [hue, adjustedLightness] = this.getOklchHue(l, c, h, locale);
    l = adjustedLightness;

    let lightness = "";
    let chroma = "";

    if (c <= 0.1 && c >= GRAY_THRESHOLD) {
      chroma = l >= 0.7 ? "pale" : "grayish";
    } else if (c >= 0.15) {
      chroma = "vibrant";
    }

    if (l < 0.3) {
      lightness = "very dark";
    } else if (l < MAX_DARK_LIGHTNESS) {
      lightness = "dark";
    } else if (l < 0.7) {
      // none
    } else if (l < 0.85) {
      lightness = "light";
    } else {
      lightness = "very light";
    }

    if (chroma) {
      chroma = strings.getStringForLocale(chroma, locale);
    }

    if (lightness) {
      lightness = strings.getStringForLocale(lightness, locale);
    }

    const alpha = this.getChannelValue("alpha");
    const formatter = new LocalizedStringFormatter(locale, strings);

    if (alpha < 1) {
      const percentTransparent = new NumberFormatter(locale, {
        style: "percent",
      }).format(1 - alpha);

      return formatter
        .format("transparentColorName", {
          chroma,
          hue,
          lightness,
          percentTransparent,
        })
        .replaceAll(/\s+/gu, " ")
        .trim();
    }

    return formatter
      .format("colorName", {
        chroma,
        hue,
        lightness,
      })
      .replaceAll(/\s+/gu, " ")
      .trim();
  }

  private readonly getOklchHue = (
    l: number,
    c: number,
    h: number,
    locale: string
  ): [string, number] => {
    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage(
        "@react-stately/color"
      ) ?? this.dictionary;

    if (c < GRAY_THRESHOLD) {
      return [strings.getStringForLocale("gray", locale), l];
    }

    let lightness = l;

    for (const [i, [hue, initialHueName]] of OKLCH_HUES.entries()) {
      let hueName = initialHueName;
      const [nextHue, nextHueName] = OKLCH_HUES[i + 1] ?? [360, "pink"];

      if (h >= hue && h < nextHue) {
        // Split orange hue into brown/orange depending on lightness.
        if (hueName === "orange") {
          if (lightness < ORANGE_LIGHTNESS_THRESHOLD) {
            hueName = "brown";
          } else {
            // Adjust lightness.
            lightness =
              lightness - ORANGE_LIGHTNESS_THRESHOLD + MAX_DARK_LIGHTNESS;
          }
        }

        // If the hue is at least halfway to the next hue, add the next hue name as well.
        if (h > hue + (nextHue - hue) / 2 && hueName !== nextHueName) {
          hueName = `${hueName} ${nextHueName}`;
        } else if (
          hueName === "yellow" &&
          lightness < YELLOW_GREEN_LIGHTNESS_THRESHOLD
        ) {
          // Yellow shifts toward green at lower lightnesses.
          hueName = "yellow green";
        }

        const name = strings
          .getStringForLocale(hueName, locale)
          .toLocaleLowerCase(locale);

        return [name, lightness];
      }
    }

    throw new Error("Unexpected hue");
  };

  getHueName(locale: string): string {
    const [l, c, h] = toOKLCH(this);
    const [name] = this.getOklchHue(l, c, h, locale);

    return name;
  }
}
