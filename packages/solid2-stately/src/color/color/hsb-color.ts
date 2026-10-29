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
 * Modified for Solid Aria: reorganized color code, type declarations, imports, and formatting;
 * added explicit constructor types for declaration emission.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { NumberFormatter } from "@internationalized/number";

import { clamp, toFixedNumber } from "../../utils/number";
import type {
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorSpace,
  Color as IColor,
} from "../types";
import { Color } from "./base-color";
import type { ColorConstructors } from "./color-constructors";
import { normalizeHue } from "./normalize-hue";

// X = <negative/positive number with/without decimal places>
// before/after a comma, 0 or more whitespaces are allowed
// - hsb(X, X%, X%)
// - hsba(X, X%, X%, X)
const HSB_REGEX =
  /^hsb(?<alphaMarker>a)?\((?<hue>[-+]?\d+(?:\.\d+)?)\s*,\s*(?<saturation>[-+]?\d+(?:\.\d+)?)%\s*,\s*(?<third>[-+]?\d+(?:\.\d+)?)%(?:\s*,\s*(?<alpha>[-+]?\d+(?:\.\d+)?))?\)$/u;

export function createHSBColorClass(
  getColorClasses: () => ColorConstructors
): ColorConstructors["HSBColor"] & {
  colorChannels: ReturnType<IColor["getColorChannels"]>;
  parse: (value: string) => IColor | undefined;
} {
  return class HSBColor extends Color {
    private readonly hue: number;
    private readonly saturation: number;
    private readonly brightness: number;
    private readonly alpha: number;

    constructor(
      hue: number,
      saturation: number,
      brightness: number,
      alpha: number
    ) {
      super();
      this.hue = hue;
      this.saturation = saturation;
      this.brightness = brightness;
      this.alpha = alpha;
    }

    static parse(value: string): HSBColor | undefined {
      const groups = HSB_REGEX.exec(value)?.groups;

      if (!groups) {
        return undefined;
      }

      const { hue, saturation, third, alpha, alphaMarker } = groups;

      if (
        hue === undefined ||
        saturation === undefined ||
        third === undefined ||
        (alphaMarker === undefined) !== (alpha === undefined)
      ) {
        return undefined;
      }

      return new HSBColor(
        normalizeHue(Number(hue)),
        clamp(Number(saturation), 0, 100),
        clamp(Number(third), 0, 100),
        clamp(Number(alpha ?? 1), 0, 1)
      );
    }

    toString(format: ColorFormat | "css" = "css") {
      switch (format) {
        case "css": {
          return this.toHSL().toString("css");
        }

        case "hex": {
          return this.toRGB().toString("hex");
        }

        case "hexa": {
          return this.toRGB().toString("hexa");
        }

        case "hsb": {
          return `hsb(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.brightness, 2)}%)`;
        }

        case "hsba": {
          return `hsba(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.brightness, 2)}%, ${this.alpha})`;
        }

        case "rgb":
        case "rgba":
        case "hsl":
        case "hsla": {
          return this.toFormat(format).toString(format);
        }

        default: {
          throw new Error("Unsupported color format");
        }
      }
    }

    toFormat(format: ColorFormat): IColor {
      switch (format) {
        case "hsb":
        case "hsba": {
          return this;
        }

        case "hsl":
        case "hsla": {
          return this.toHSL();
        }

        case "rgb":
        case "rgba": {
          return this.toRGB();
        }

        case "hex":
        case "hexa": {
          throw new Error(`Unsupported color conversion: hsb -> ${format}`);
        }

        default: {
          throw new Error("Unsupported color format");
        }
      }
    }

    /**
     * Converts a HSB color to HSL.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL.
     *
     * @returns An HSLColor object.
     */
    private toHSL(): IColor {
      let saturation = this.saturation / 100;
      const brightness = this.brightness / 100;
      const lightness = brightness * (1 - saturation / 2);
      saturation =
        lightness === 0 || lightness === 1
          ? 0
          : (brightness - lightness) / Math.min(lightness, 1 - lightness);

      return new (getColorClasses().HSLColor)(
        toFixedNumber(this.hue, 2),
        toFixedNumber(saturation * 100, 2),
        toFixedNumber(lightness * 100, 2),
        this.alpha
      );
    }

    /**
     * Converts a HSV color value to RGB. Conversion formula adapted from
     * https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative.
     *
     * @returns An RGBColor object.
     */
    private toRGB(): IColor {
      const { hue } = this;
      const saturation = this.saturation / 100;
      const brightness = this.brightness / 100;

      const fn = (n: number, k = (n + hue / 60) % 6) =>
        brightness -
        saturation * brightness * Math.max(Math.min(k, 4 - k, 1), 0);

      return new (getColorClasses().RGBColor)(
        Math.round(fn(5) * 255),
        Math.round(fn(3) * 255),
        Math.round(fn(1) * 255),
        this.alpha
      );
    }

    getChannelValue(channel: ColorChannel): number {
      const values: Partial<Record<ColorChannel, number>> = {
        alpha: this.alpha,
        brightness: this.brightness,
        hue: this.hue,
        saturation: this.saturation,
      };

      const value = values[channel];

      if (value === undefined) {
        throw new Error(`Unsupported color channel: ${channel}`);
      }

      return value;
    }

    withChannelValue(channel: ColorChannel, value: number): IColor {
      this.getChannelValue(channel);

      return new HSBColor(
        channel === "hue" ? value : this.hue,
        channel === "saturation" ? value : this.saturation,
        channel === "brightness" ? value : this.brightness,
        channel === "alpha" ? value : this.alpha
      );
    }

    clone(): IColor {
      return new HSBColor(
        this.hue,
        this.saturation,
        this.brightness,
        this.alpha
      );
    }

    private readonly channelRanges: Partial<
      Record<ColorChannel, ColorChannelRange>
    > = {
      alpha: { maxValue: 1, minValue: 0, pageSize: 0.1, step: 0.01 },
      brightness: { maxValue: 100, minValue: 0, pageSize: 10, step: 1 },
      hue: { maxValue: 360, minValue: 0, pageSize: 15, step: 1 },
      saturation: { maxValue: 100, minValue: 0, pageSize: 10, step: 1 },
    };

    getChannelRange(channel: ColorChannel): ColorChannelRange {
      const value = this.channelRanges[channel];

      if (value === undefined) {
        throw new Error(`Unknown color channel: ${channel}`);
      }

      return value;
    }

    private readonly channelFormatOptions: Partial<
      Record<ColorChannel, Intl.NumberFormatOptions>
    > = {
      alpha: { style: "percent" },
      brightness: { style: "percent" },
      hue: { style: "unit", unit: "degree", unitDisplay: "narrow" },
      saturation: { style: "percent" },
    };

    getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
      const value = this.channelFormatOptions[channel];

      if (value === undefined) {
        throw new Error(`Unknown color channel: ${channel}`);
      }

      return value;
    }

    formatChannelValue(channel: ColorChannel, locale: string) {
      const options = this.getChannelFormatOptions(channel);
      let value = this.getChannelValue(channel);

      if (channel === "saturation" || channel === "brightness") {
        value /= 100;
      }

      return new NumberFormatter(locale, options).format(value);
    }

    private readonly colorSpace: ColorSpace = "hsb";

    getColorSpace(): ColorSpace {
      return this.colorSpace;
    }

    static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = [
      "hue",
      "saturation",
      "brightness",
    ];
    private readonly colorChannels = HSBColor.colorChannels;

    getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
      return this.colorChannels;
    }
  };
}
