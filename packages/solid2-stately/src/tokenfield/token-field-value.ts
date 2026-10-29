/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/tokenfield/TokenFieldValue.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { requireValue } from "../utils/require-value";

export type TokenFieldSegment<T = unknown> = TextSegment | TokenSegment<T>;

export interface TextSegment {
  type: "text";
  text: string;
}

export interface TokenSegment<T = unknown> {
  type: "token";
  text: string;
  /** An arbitrary value associated with the token. */
  value?: T;
}

export interface Position {
  /** Index of the segment in the list. */
  index: number;
  /** Text offset within the segment in UTF-16 code units. */
  offset: number;
}

/** Represents a text selection in a TokenField. */
export class SelectedRange {
  /** The anchor position. */
  anchor: Position;
  /** The current (i.e. caret) position. */
  current: Position;
  /**
   * Creates a new selection range. If only a single position is provided, the selection is
   * collapsed.
   */
  constructor(anchor: Position, current: Position = anchor) {
    this.anchor = anchor;
    this.current = current;
  }
  /** Whether the selection is collapsed to a single caret position. */
  get isCollapsed() {
    return (
      this.anchor.index === this.current.index &&
      this.anchor.offset === this.current.offset
    );
  }
  /** The side of the selection closest to the start of the value. */
  get start() {
    return compare(this.anchor, this.current) < 0 ? this.anchor : this.current;
  }
  /** The side of the selection closest to the end of the value. */
  get end() {
    return compare(this.anchor, this.current) < 0 ? this.current : this.anchor;
  }
  /** Returns whether this selection is equal to another. */
  isEqual(other: SelectedRange) {
    if (this === other) {
      return true;
    }

    return (
      this.anchor.index === other.anchor.index &&
      this.anchor.offset === other.anchor.offset &&
      this.current.index === other.current.index &&
      this.current.offset === other.current.offset
    );
  }
}

function compare(a: Position, b: Position) {
  if (a.index === b.index) {
    return a.offset - b.offset;
  }

  return a.index - b.index;
}

enum Direction {
  Forward = 1,
  Backward = -1,
}

export interface TokenFieldValueOptions {
  selectedRange?: SelectedRange | null;
}

/**
 * A list of segments containing editable text and non-editable tokens.
 */
export class TokenFieldValue<T = unknown> {
  static readonly Direction = Direction;
  static readonly SelectedRange = SelectedRange;
  /** The text and token segments in the list. */
  readonly segments: readonly TokenFieldSegment<T>[];
  /** The selected range. */
  selectedRange: SelectedRange;
  // Linked list representing the undo/redo history.
  private previous: this | null = null;
  private next: this | null = null;
  private isCoalescing = true;
  /** Create a new list with the given segments. */
  constructor(
    tokens: readonly TokenFieldSegment<T>[],
    options?: TokenFieldValueOptions
  ) {
    this.segments = tokens;
    this.selectedRange =
      options?.selectedRange ?? new SelectedRange({ index: 0, offset: 0 });
  }
  protected createFieldValue(segments: readonly TokenFieldSegment<T>[]): this {
    // SAFETY: TokenFieldValue subclasses inherit the segment constructor contract and immutable edits preserve the runtime class.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const Constructor = this.constructor as new (
      segments: readonly TokenFieldSegment<T>[],
      options?: TokenFieldValueOptions
    ) => this;

    return new Constructor(segments);
  }
  get caretPosition(): Position {
    return this.selectedRange.current;
  }
  /** Create a new list with the caret position set to the given position. */
  withSelectedRange(selectedRange: SelectedRange): this {
    if (this.selectedRange.isEqual(selectedRange)) {
      return this;
    }

    const result = this.createFieldValue(this.segments);
    result.selectedRange = selectedRange;
    result.previous = this.previous;
    result.next = this.next;
    result.isCoalescing = this.isCoalescing;

    return result;
  }
  withCaretPosition(position: Position): this {
    return this.withSelectedRange(new SelectedRange(position));
  }
  private static splitSegment<T>(
    segment: TokenFieldSegment<T> | undefined,
    offset: number
  ): [TokenFieldSegment<T> | null, TokenFieldSegment<T> | null] {
    if (!segment) {
      const empty = TokenFieldValue.createTextSegment("");

      return [offset > 0 ? empty : null, offset > 0 ? null : empty];
    }

    if (segment.type === "token") {
      return [
        offset > 0 ? { ...segment } : null,
        offset > 0 ? null : { ...segment },
      ];
    }

    return [
      offset > 0 ? { text: segment.text.slice(0, offset), type: "text" } : null,
      offset < segment.text.length
        ? TokenFieldValue.createTextSegment(segment.text.slice(offset))
        : null,
    ];
  }
  private static createTextSegment(text: string): TextSegment {
    return { text, type: "text" };
  }
  protected tokenize(text: string): TokenFieldSegment<T>[] {
    return [TokenFieldValue.createTextSegment(text)];
  }
  private clampPosition(position: Position): Position {
    if (this.segments.length === 0) {
      return { index: 0, offset: 0 };
    }

    if (this.segments.length > 0 && position.index >= this.segments.length) {
      return {
        index: this.segments.length - 1,
        offset: requireValue(
          this.segments.at(-1),
          "Expected this.segments.at(-1) to exist."
        ).text.length,
      };
    }

    if (position.index < 0) {
      return { index: 0, offset: 0 };
    }

    return position;
  }
  /** Replace the text between two positions with new text. */
  replaceRange(
    start: Position,
    end: Position,
    text: string,
    coalesce = true
  ): this {
    return this.replaceRangeWithSegments(
      start,
      end,
      text.length > 0 ? [TokenFieldValue.createTextSegment(text)] : [],
      coalesce
    );
  }
  /** Replace the text between two positions with new segments. */
  replaceRangeWithSegments(
    initialStart: Position,
    initialEnd: Position,
    insert: TokenFieldSegment<T>[],
    coalesce = true
  ): this {
    let start = initialStart;

    let end = initialEnd;

    start = this.clampPosition(start);
    end = this.clampPosition(end);
    const startSegment = this.segments[start.index];
    const endSegment = this.segments[end.index];

    const [startSplit] = TokenFieldValue.splitSegment(
      startSegment,
      start.offset
    );

    const [, endSplit] = TokenFieldValue.splitSegment(endSegment, end.offset);
    const newSegments = this.segments.slice(0, start.index);

    if (startSplit) {
      appendSegments(newSegments, [startSplit]);
    }

    if (insert.length) {
      appendSegments(newSegments, insert, (text) => this.tokenize(text));
    }

    const lastSegment = newSegments.at(-1);
    const lastIsText = lastSegment && lastSegment.type === "text";

    const caret = {
      index: lastIsText === true ? newSegments.length - 1 : newSegments.length,
      offset: lastIsText === true ? lastSegment.text.length : 0,
    };

    if (endSplit) {
      appendSegments(newSegments, [endSplit]);
    }

    appendSegments(newSegments, this.segments.slice(end.index + 1));
    const segments = this.createFieldValue(newSegments);
    segments.selectedRange = new SelectedRange(caret);
    segments.isCoalescing = coalesce;

    if (this.isCoalescing && coalesce && this.previous) {
      segments.previous = this.previous;
      segments.previous.next = segments;
    } else {
      segments.previous = this;
      this.selectedRange = new SelectedRange(start, end);
      this.next = segments;
    }

    return segments;
  }
  /** Find the boundary before or after a position using an Intl.Segmenter. */
  findBoundaryWithSegmenter(
    initialPosition: Position,
    segmenter: Intl.Segmenter,
    direction: Direction
  ): Position | null {
    let position = initialPosition;

    position = this.clampPosition(position);

    for (
      let i = position.index;
      i >= 0 && i < this.segments.length;
      i += direction
    ) {
      const segment = requireValue(
        this.segments[i],
        "Token traversal must stay within its segments."
      );

      switch (segment.type) {
        case "token": {
          if (
            i !== position.index ||
            (direction === Direction.Backward
              ? position.offset > 0
              : position.offset === 0)
          ) {
            const index = i + direction;

            return {
              index: Math.max(index, 0),
              offset:
                direction === Direction.Backward && index >= 0
                  ? requireValue(
                      this.segments[index],
                      "Expected this.segments[index] to exist."
                    ).text.length
                  : 0,
            };
          }

          continue;
        }

        case "text": {
          let offset =
            direction === Direction.Backward ? segment.text.length : 0;

          if (i === position.index) {
            ({ offset } = position);
          }

          if (direction === Direction.Backward) {
            offset -= 1;
          }

          if (offset < 0 || offset >= segment.text.length) {
            continue;
          }

          let part = segmenter.segment(segment.text).containing(offset);

          while (part && part.isWordLike === false) {
            offset += direction;
            part = segmenter.segment(segment.text).containing(offset);
          }

          if (part) {
            return {
              index: i,
              offset:
                direction === Direction.Backward
                  ? part.index
                  : part.index + part.segment.length,
            };
          }

          continue;
        }

        default: {
          break;
        }
      }
    }

    return null;
  }
  /** Find a line boundary before or after a position. */
  findLineBoundary(position: Position, direction: Direction): Position | null {
    const res = this.findText(position, direction, "\n");

    if (res) {
      return res;
    }

    return direction === Direction.Backward
      ? { index: 0, offset: 0 }
      : {
          index: Math.max(0, this.segments.length - 1),
          offset: this.segments.at(-1)?.text.length ?? 0,
        };
  }
  /** Find a string or regular expression match before or after a position. */
  findText(
    position: Position,
    direction: Direction,
    search: string | RegExp
  ): Position | null {
    if (this.segments.length === 0) {
      return null;
    }

    for (
      let i = position.index;
      i >= 0 && i < this.segments.length;
      i += direction
    ) {
      const segment = requireValue(
        this.segments[i],
        "Token traversal must stay within its segments."
      );

      if (segment.type !== "text") {
        continue;
      }

      const offset = findInText(
        segment.text,
        search,
        direction,
        i === position.index ? position.offset : undefined
      );

      if (offset >= 0) {
        return {
          index: i,
          offset,
        };
      }
    }

    return null;
  }
  /** Delete text at a position using a segmenter. */
  delete(
    position: Position,
    segmenter: Intl.Segmenter,
    direction: Direction,
    coalesce = true
  ): this {
    const boundary = this.findBoundaryWithSegmenter(
      position,
      segmenter,
      direction
    );

    if (boundary) {
      return this.replaceRange(
        direction === Direction.Backward ? boundary : position,
        direction === Direction.Backward ? position : boundary,
        "",
        coalesce
      );
    }

    return this.withSelectedRange(new SelectedRange(position));
  }
  /** Delete text to the next or previous line break. */
  deleteLine(position: Position, direction: Direction, coalesce = true): this {
    if (this.segments.length === 0) {
      return this;
    }

    const boundary = this.findLineBoundary(position, direction);

    if (boundary) {
      return this.replaceRange(
        direction === Direction.Backward ? boundary : position,
        direction === Direction.Backward ? position : boundary,
        "",
        coalesce
      );
    }

    return this.withSelectedRange(new SelectedRange(position));
  }
  /** Create a new list containing a subset of the segments. */
  slice(initialStart: Position, initialEnd: Position): this {
    let start = initialStart;

    let end = initialEnd;

    start = this.clampPosition(start);
    end = this.clampPosition(end);

    if (start.index === end.index && start.offset === end.offset) {
      return this.createFieldValue([]);
    }

    if (start.index === end.index) {
      const segment = requireValue(
        this.segments[start.index],
        "A token slice must reference an existing segment."
      );

      if (segment.type === "text") {
        return this.createFieldValue([
          {
            text: segment.text.slice(start.offset, end.offset),
            type: "text",
          },
        ]);
      }

      return this.createFieldValue([segment]);
    }

    const startSegment = this.segments[start.index];
    const endSegment = this.segments[end.index];

    const [, startSplit] = TokenFieldValue.splitSegment(
      startSegment,
      start.offset
    );

    const [endSplit] = TokenFieldValue.splitSegment(endSegment, end.offset);
    const result: TokenFieldSegment<T>[] = [];

    if (startSplit) {
      result.push(startSplit);
    }

    result.push(...this.segments.slice(start.index + 1, end.index));

    if (endSplit) {
      result.push(endSplit);
    }

    return this.createFieldValue(result);
  }
  /** Convert the list to a string. */
  toString(): string {
    return this.segments.map((seg) => seg.text).join("");
  }
  /** Returns the previous list in the undo history. */
  undo(): this {
    return this.previous ?? this;
  }
  /** Returns the next list in the redo history. */
  redo(): this {
    return this.next ?? this;
  }
  /** End coalescing undo/redo history. */
  endCoalescing(): void {
    this.isCoalescing = false;
  }
}

function findInText(
  text: string,
  search: string | RegExp,
  direction: Direction,
  fromOffset?: number
): number {
  if (typeof search === "string") {
    if (direction === Direction.Backward) {
      return text.lastIndexOf(
        search,
        fromOffset === undefined ? text.length - 1 : fromOffset - 1
      );
    }

    return text.indexOf(search, fromOffset ?? 0);
  }

  if (direction === Direction.Forward) {
    const start = fromOffset ?? 0;
    const index = text.slice(start).search(search);

    return index >= 0 ? start + index : -1;
  }

  const limit = fromOffset ?? text.length;

  if (limit < 0) {
    return -1;
  }

  const re = search.flags.includes("g")
    ? search
    : new RegExp(search.source, `${search.flags}g`);

  const matches = [...text.slice(0, limit).matchAll(re)];

  return matches.at(-1)?.index ?? -1;
}

function appendSegments<T>(
  segments: TokenFieldSegment<T>[],
  insert: TokenFieldSegment<T>[],
  tokenize?: (text: string) => TokenFieldSegment<T>[]
): TokenFieldSegment<T>[] {
  for (const segment of insert) {
    if (segment.type === "text" && segment.text.length === 0) {
      continue;
    }

    const last = segments.at(-1);

    if (last && last.type === "text" && segment.type === "text") {
      if (tokenize) {
        const tokenized = tokenize(last.text + segment.text);
        segments.splice(-1, 1, ...tokenized);
      } else {
        segments[segments.length - 1] = {
          text: last.text + segment.text,
          type: "text",
        };
      }
    } else if (tokenize && segment.type === "text") {
      const tokenized = tokenize(segment.text);
      segments.push(...tokenized);
    } else {
      segments.push(segment);
    }
  }

  return segments;
}
