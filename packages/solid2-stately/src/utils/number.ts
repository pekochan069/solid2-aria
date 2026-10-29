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
 * Derived from Adobe React Spectrum: packages/react-stately/src/utils/number.ts.
 * Modified for Solid Aria: adapted state handling, APIs, or formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

/**
 * Takes a value and forces it to the closest min/max if it's outside. Also forces it to the closest
 * valid step.
 */

export function clamp(value: number, min = -Infinity, max = Infinity): number {
  const newValue = Math.min(Math.max(value, min), max);

  return newValue;
}

export function roundToStepPrecision(value: number, step: number): number {
  let roundedValue = value;
  let precision = 0;
  const stepString = step.toString();
  // Handle negative exponents in exponential notation (e.g., "1e-7" → precision 8)
  const eIndex = stepString.toLowerCase().indexOf("e-");

  if (eIndex > 0) {
    precision = Math.abs(Math.floor(Math.log10(Math.abs(step)))) + eIndex;
  } else {
    const pointIndex = stepString.indexOf(".");

    if (pointIndex !== -1) {
      precision = stepString.length - pointIndex;
    }
  }

  if (precision > 0) {
    const pow = 10 ** precision;
    roundedValue = Math.round(roundedValue * pow) / pow;
  }

  return roundedValue;
}

export function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number
): number {
  const minOrNan = Number(min);
  const maxOrNan = Number(max);
  const remainder = (value - (Number.isNaN(minOrNan) ? 0 : minOrNan)) % step;

  let snappedValue = roundToStepPrecision(
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder,
    step
  );

  if (!Number.isNaN(minOrNan)) {
    if (snappedValue < minOrNan) {
      snappedValue = minOrNan;
    } else if (!Number.isNaN(maxOrNan) && snappedValue > maxOrNan) {
      snappedValue =
        minOrNan +
        Math.floor(roundToStepPrecision((maxOrNan - minOrNan) / step, step)) *
          step;
    }
  } else if (!Number.isNaN(maxOrNan) && snappedValue > maxOrNan) {
    snappedValue =
      Math.floor(roundToStepPrecision(maxOrNan / step, step)) * step;
  }

  // correct floating point behavior by rounding to step precision
  snappedValue = roundToStepPrecision(snappedValue, step);

  return snappedValue;
}

/* Takes a value and rounds off to the number of digits. */
export function toFixedNumber(
  value: number,
  digits: number,
  base = 10
): number {
  const pow = base ** digits;

  return Math.round(value * pow) / pow;
}
