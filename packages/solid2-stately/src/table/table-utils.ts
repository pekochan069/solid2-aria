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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/TableUtils.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";

import { requireValue } from "../utils/require-value";
import type { ColumnSize } from "./column";

// numbers and percents are considered static. *fr units or a lack of units are considered dynamic.
export function isStatic(width?: string | number | null): boolean {
  return (
    width !== null &&
    width !== undefined &&
    (!Number.isNaN(Number(width)) ||
      /^(?<amount>\d+)(?=%$)/u.exec(String(width)) !== null)
  );
}

export function parseFractionalUnit(width?: string | number | null): number {
  if (
    width === null ||
    width === undefined ||
    width === "" ||
    typeof width === "number"
  ) {
    return 1;
  }

  const match = /^(?<amount>.+)(?=fr$)/u.exec(width);

  // if width is the incorrect format, just default it to a 1fr
  if (!match) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `width: ${width} is not a supported format, width should be a number (ex. 150), percentage (ex. '50%') or fr unit (ex. '2fr')`,
        "defaulting to '1fr'"
      );
    }

    return 1;
  }

  return Number(match[0]);
}

export function parseStaticWidth(
  width: number | string,
  tableWidth: number
): number {
  if (typeof width === "string") {
    const match = /^(?<amount>\d+)(?=%$)/u.exec(width);

    if (!match) {
      throw new Error(
        "Only percentages or numbers are supported for static column widths"
      );
    }

    return tableWidth * (Number(match[0]) / 100);
  }

  return width;
}

export function getMaxWidth(
  maxWidth: number | string | null | undefined,
  tableWidth: number
): number {
  return maxWidth === null || maxWidth === undefined
    ? Number.MAX_SAFE_INTEGER
    : parseStaticWidth(maxWidth, tableWidth);
}

// cannot support FR units, we'd need to know everything else in the table to do that
export function getMinWidth(
  minWidth: number | string | null | undefined,
  tableWidth: number
): number {
  return minWidth === null || minWidth === undefined
    ? 0
    : parseStaticWidth(minWidth, tableWidth);
}

export interface IColumn {
  minWidth?: number | string;
  maxWidth?: number | string;
  width?: number | string;
  defaultWidth?: number | string;
  key: Key;
}

interface FlexItem {
  frozen: boolean;
  baseSize: number;
  hypotheticalMainSize: number;
  min: number;
  max: number;
  flex: number;
  targetMainSize: number;
  violation: number;
}

/**
 * Implements the flex algorithm described in https://www.w3.org/TR/css-flexbox-1/#layout-algorithm
 * It makes a few constraint/assumptions: 1. All basis values are 0 unless it is a static width,
 * then the basis is the static width 2. All flex grow and shrink values are equal to the FR
 * specified on the column, grow and shrink for the same column are equal 3. We only have one row An
 * example of the setup can be seen here https://jsfiddle.net/snowystinger/wv0ymjaf/61/ where I let
 * the browser figure out the flex of the columns. Note: We differ in one key aspect, all of our
 * column widths must be whole numbers, so we avoid browser sub pixel rounding errors. To do this,
 * we use a cascading rounding algorithm to ensure that the sum of the widths is maintained while
 * distributing the rounding remainder across the columns.
 *
 * As noted in the chrome source code, this algorithm is very accurate, but has the potential to be
 * quadratic. They have deemed this to be acceptable because the number of elements is usually small
 * and the flex factors are usually not high variance. I believe we can make the same assumptions.
 * Particularly once resizing is started, it will convert all columns to the left to static widths,
 * so it will cut down on the number of FR columns.
 *
 * There are likely faster ways to do this, I've chosen to stick to the spec as closely as possible
 * for readability, accuracy, and for the note that this behaving quadratically is unlikely to be a
 * problem.
 *
 * @param availableWidth - The visible width of the table.
 * @param columns - The table defined columns.
 * @param changedColumns - Any columns we want to override, for example, during resizing.
 * @param getDefaultWidth - A function that returns the default width of a column by its index.
 * @param getDefaultMinWidth - A function that returns the default min width of a column by its
 *   index.
 */
export function calculateColumnSizes(
  initialAvailableWidth: number,
  columns: IColumn[],
  changedColumns: Map<Key, ColumnSize>,
  getDefaultWidth?: (index: number) => ColumnSize | null | undefined,
  getDefaultMinWidth?: (index: number) => ColumnSize | null | undefined
): number[] {
  let availableWidth = initialAvailableWidth;
  const originalWidth = availableWidth;
  const flooredWidth = Math.floor(availableWidth);
  const hasFractionalWidth = availableWidth - flooredWidth > 0;
  availableWidth = flooredWidth;
  let hasNonFrozenItems = false;

  const flexItems: FlexItem[] = columns.map((column, index) => {
    const width =
      changedColumns.get(column.key) === null ||
      changedColumns.get(column.key) === undefined
        ? (column.width ??
          column.defaultWidth ??
          getDefaultWidth?.(index) ??
          "1fr")
        : (changedColumns.get(column.key) ?? "1fr");

    let frozen = false;
    let baseSize = 0;
    let flex = 0;
    let targetMainSize = 0;

    if (isStatic(width)) {
      baseSize = parseStaticWidth(width, availableWidth);
      frozen = true;
    } else {
      flex = parseFractionalUnit(width);

      if (flex <= 0) {
        frozen = true;
      }
    }

    const min = getMinWidth(
      column.minWidth ?? getDefaultMinWidth?.(index) ?? 0,
      availableWidth
    );

    const max = getMaxWidth(column.maxWidth, availableWidth);
    const hypotheticalMainSize = Math.max(min, Math.min(baseSize, max));

    // 9.7.1
    // We don't make use of flex basis, it's always 0, so we are always in 'grow' mode.
    // 9.7.2
    if (frozen) {
      targetMainSize = hypotheticalMainSize;
    } else if (baseSize > hypotheticalMainSize) {
      frozen = true;
      targetMainSize = hypotheticalMainSize;
    }

    // 9.7.3
    if (!frozen) {
      hasNonFrozenItems = true;
    }

    return {
      baseSize,
      flex,
      frozen,
      hypotheticalMainSize,
      max,
      min,
      targetMainSize,
      violation: 0,
    };
  });

  // 9.7.4
  // 9.7.4.a
  while (hasNonFrozenItems) {
    // 9.7.4.b
    /**
     * Calculate the remaining free space as for initial free space,
     * above (9.7.3). If the sum of the unfrozen flex items’ flex factors is
     * less than one, multiply the initial free space by this sum (of flex factors).
     * If the magnitude of this value is less than the magnitude of
     * the remaining free space, use this as the remaining free space.
     */
    let usedWidth = 0;
    let flexFactors = 0;

    for (const item of flexItems) {
      if (item.frozen) {
        usedWidth += item.targetMainSize;
      } else {
        usedWidth += item.baseSize;
        flexFactors += item.flex;
      }
    }

    const remainingFreeSpace = availableWidth - usedWidth;

    // we only support integer FR's, and because of hasNonFrozenItems, we know that flexFactors > 0
    // so no need to check for flexFactors < 1
    // 9.7.4.c
    /**
     * If the remaining free space is zero
     * - Do nothing.
     * Else // remember, we're always in grow mode
     * - Find the ratio of the item’s flex grow factor to the
     * sum of the flex grow factors of all unfrozen items on
     * the line. Set the item’s target main size to its flex
     * base size plus a fraction of the remaining free space
     * proportional to the ratio.
     */
    if (remainingFreeSpace > 0) {
      for (const item of flexItems) {
        if (!item.frozen) {
          const ratio = item.flex / flexFactors;
          item.targetMainSize = item.baseSize + ratio * remainingFreeSpace;
        }
      }
    }

    // 9.7.4.d
    /**
     * Fix min/max violations. Clamp each non-frozen item’s
     * target main size by its used min and max main sizes
     * and floor its content-box size at zero. If the item’s
     * target main size was made smaller by this, it’s a max
     * violation. If the item’s target main size was made
     * larger by this, it’s a min violation.
     */
    let totalViolation = 0;

    for (const item of flexItems) {
      item.violation = 0;

      if (!item.frozen) {
        const { min, max, targetMainSize } = item;
        item.targetMainSize = Math.max(min, Math.min(targetMainSize, max));
        item.violation = item.targetMainSize - targetMainSize;
        totalViolation += item.violation;
      }
    }

    // 9.7.4.e
    /**
     * Freeze over-flexed items. The total violation is the
     * sum of the adjustments from the previous step
     * ∑(clamped size - unclamped size). If the total violation is:
     * Zero
     * - Freeze all items.
     *
     * Positive
     * - Freeze all the items with min violations.
     *
     * Negative
     * - Freeze all the items with max violations.
     */
    hasNonFrozenItems = false;

    for (const item of flexItems) {
      if (
        totalViolation === 0 ||
        Math.sign(totalViolation) === Math.sign(item.violation)
      ) {
        item.frozen = true;
      } else if (!item.frozen) {
        hasNonFrozenItems = true;
      }
    }
  }

  const columnSizes = cascadeRounding(flexItems);

  // Give the leftover sub-pixel width to the last column so the columns sum
  // exactly to the (possibly fractional) available width.
  if (hasFractionalWidth && columnSizes.length > 0) {
    const [, tableFractionalWidth] = originalWidth.toString().split(".");

    const columnWidth = requireValue(
      columnSizes.at(-1),
      "Expected columnSizes.at(-1) to exist."
    ).toString();

    columnSizes[columnSizes.length - 1] = Number(
      `${columnWidth}.${tableFractionalWidth}`
    );
  }

  return columnSizes;
}

function cascadeRounding(flexItems: FlexItem[]): number[] {
  /*
      Given an array of floats that sum to an integer, this rounds the floats
      and returns an array of integers with the same sum.
      */
  let fpTotal = 0;
  let intTotal = 0;
  const roundedArray: number[] = [];

  for (const item of flexItems) {
    const float = item.targetMainSize;
    const integer = Math.round(float + fpTotal) - intTotal;
    fpTotal += float;
    intTotal += integer;
    roundedArray.push(integer);
  }

  return roundedArray;
}
