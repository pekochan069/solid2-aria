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

export function createRGBColorClass(
  getColorClasses: () => ColorConstructors
): ColorConstructors["RGBColor"] & {
  colorChannels: ReturnType<IColor["getColorChannels"]>;
  parse: (value: string) => IColor | undefined;
} {
  return class RGBColor extends Color {
    private readonly red: number;
    private readonly green: number;
    private readonly blue: number;
    private readonly alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
      super();
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.alpha = alpha;
    }

    static parse(value: string): RGBColor | undefined {
      let colors: (number | undefined)[] = [];

      // matching #rgb, #rgba, #rrggbb, #rrggbbaa
      if (/^#[\da-f]+$/iu.test(value) && [4, 5, 7, 9].includes(value.length)) {
        const values = (
          value.length < 6 ? value.replaceAll(/[^#]/giu, "$&$&") : value
        )
          .slice(1)
          .split("");

        while (values.length > 0) {
          colors.push(Number.parseInt(values.splice(0, 2).join(""), 16));
        }

        colors[3] = colors[3] === undefined ? undefined : colors[3] / 255;
      }

      // matching rgb(rrr, ggg, bbb), rgba(rrr, ggg, bbb, 0.a)
      const match = /^rgba?\((?<components>.*)\)$/u.exec(value);

      if (
        match?.groups?.components !== undefined &&
        match.groups.components !== ""
      ) {
        const parts = match.groups.components
          .split(",")
          .map((part) => part.trim());

        // Number('') is 0 rather than NaN, so empty components need their own check.
        if (
          parts.some((part) => part === "" || !Number.isFinite(Number(part)))
        ) {
          return undefined;
        }

        colors = parts.map((part, i) =>
          clamp(Number(part), 0, i < 3 ? 255 : 1)
        );
      }

      if (
        colors[0] === undefined ||
        colors[1] === undefined ||
        colors[2] === undefined
      ) {
        return undefined;
      }

      return colors.length < 3
        ? undefined
        : new RGBColor(colors[0], colors[1], colors[2], colors[3] ?? 1);
    }

    toString(format: ColorFormat | "css" = "css") {
      switch (format) {
        case "hex": {
          return `#${(
            this.red.toString(16).padStart(2, "0") +
            this.green.toString(16).padStart(2, "0") +
            this.blue.toString(16).padStart(2, "0")
          ).toUpperCase()}`;
        }

        case "hexa": {
          return `#${(
            this.red.toString(16).padStart(2, "0") +
            this.green.toString(16).padStart(2, "0") +
            this.blue.toString(16).padStart(2, "0") +
            Math.round(this.alpha * 255)
              .toString(16)
              .padStart(2, "0")
          ).toUpperCase()}`;
        }

        case "rgb": {
          return `rgb(${this.red}, ${this.green}, ${this.blue})`;
        }

        case "css":
        case "rgba": {
          return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
        }

        case "hsb":
        case "hsba":
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
        case "hex":
        case "hexa":
        case "rgb":
        case "rgba": {
          return this;
        }

        case "hsb":
        case "hsba": {
          return this.toHSB();
        }

        case "hsl":
        case "hsla": {
          return this.toHSL();
        }

        default: {
          throw new Error("Unsupported color conversion from rgb");
        }
      }
    }

    override toHexInt(): number {
      // oxlint-disable-next-line no-bitwise -- Pack channels into a 24-bit integer, truncating fractional values.
      return (this.red << 16) | (this.green << 8) | this.blue;
    }

    /**
     * Converts an RGB color value to HSB.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
     *
     * @returns An HSBColor object.
     */
    private toHSB(): IColor {
      const red = this.red / 255;
      const green = this.green / 255;
      const blue = this.blue / 255;
      const min = Math.min(red, green, blue);
      const brightness = Math.max(red, green, blue);
      const chroma = brightness - min;
      const saturation = brightness === 0 ? 0 : chroma / brightness;
      // Achromatic colors have zero hue.
      let hue = 0;

      if (chroma !== 0) {
        switch (brightness) {
          case red: {
            hue = (green - blue) / chroma + (green < blue ? 6 : 0);
            break;
          }

          case green: {
            hue = (blue - red) / chroma + 2;
            break;
          }

          default: {
            hue = (red - green) / chroma + 4;
            break;
          }
        }

        hue /= 6;
      }

      return new (getColorClasses().HSBColor)(
        toFixedNumber(hue * 360, 2),
        toFixedNumber(saturation * 100, 2),
        toFixedNumber(brightness * 100, 2),
        this.alpha
      );
    }

    /**
     * Converts an RGB color value to HSL.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
     *
     * @returns An HSLColor object.
     */
    private toHSL(): IColor {
      const red = this.red / 255;
      const green = this.green / 255;
      const blue = this.blue / 255;
      const min = Math.min(red, green, blue);
      const max = Math.max(red, green, blue);
      const lightness = (max + min) / 2;
      const chroma = max - min;
      let hue: number;
      let saturation: number;

      if (chroma === 0) {
        // Achromatic colors have zero hue and saturation.
        hue = 0;
        saturation = 0;
      } else {
        saturation = chroma / (lightness < 0.5 ? max + min : 2 - max - min);

        switch (max) {
          case red: {
            hue = (green - blue) / chroma + (green < blue ? 6 : 0);
            break;
          }

          case green: {
            hue = (blue - red) / chroma + 2;
            break;
          }

          default: {
            hue = (red - green) / chroma + 4;
            break;
          }
        }

        hue /= 6;
      }

      return new (getColorClasses().HSLColor)(
        toFixedNumber(hue * 360, 2),
        toFixedNumber(saturation * 100, 2),
        toFixedNumber(lightness * 100, 2),
        this.alpha
      );
    }

    getChannelValue(channel: ColorChannel): number {
      const values: Partial<Record<ColorChannel, number>> = {
        alpha: this.alpha,
        blue: this.blue,
        green: this.green,
        red: this.red,
      };

      const value = values[channel];

      if (value === undefined) {
        throw new Error(`Unsupported color channel: ${channel}`);
      }

      return value;
    }

    withChannelValue(channel: ColorChannel, value: number): IColor {
      this.getChannelValue(channel);

      return new RGBColor(
        channel === "red" ? value : this.red,
        channel === "green" ? value : this.green,
        channel === "blue" ? value : this.blue,
        channel === "alpha" ? value : this.alpha
      );
    }

    clone(): IColor {
      return new RGBColor(this.red, this.green, this.blue, this.alpha);
    }

    private readonly channelRanges: Partial<
      Record<ColorChannel, ColorChannelRange>
    > = {
      alpha: { maxValue: 1, minValue: 0, pageSize: 0.1, step: 0.01 },
      blue: { maxValue: 255, minValue: 0, pageSize: 17, step: 1 },
      green: { maxValue: 255, minValue: 0, pageSize: 17, step: 1 },
      red: { maxValue: 255, minValue: 0, pageSize: 17, step: 1 },
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
      blue: { style: "decimal" },
      green: { style: "decimal" },
      red: { style: "decimal" },
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
      const value = this.getChannelValue(channel);

      return new NumberFormatter(locale, options).format(value);
    }

    private readonly colorSpace: ColorSpace = "rgb";

    getColorSpace(): ColorSpace {
      return this.colorSpace;
    }

    static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = [
      "red",
      "green",
      "blue",
    ];
    private readonly colorChannels = RGBColor.colorChannels;

    getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
      return this.colorChannels;
    }
  };
}
