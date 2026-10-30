// Generated from the Solid2 Aria registry's render-prop class helper.
import type { JSX } from "@solidjs/web";
import { cn as mergeClasses } from "cn";

type RenderClass<T> = JSX.ClassValue | ((state: T) => JSX.ClassValue);

export function cn(...inputs: JSX.ClassValue[]): string;
export function cn<T>(
  ...inputs: RenderClass<T>[]
): string | ((state: T) => string);
export function cn<T>(
  ...inputs: RenderClass<T>[]
): string | ((state: T) => string) {
  if (inputs.some((input) => typeof input === "function")) {
    return (state) =>
      mergeClasses(
        inputs.map((input) =>
          typeof input === "function" ? input(state) : input
        )
      );
  }

  return mergeClasses(inputs);
}
