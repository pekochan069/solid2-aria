import type { PointerType } from "@solid2-aria/types-shared";

/** Normalize the native pointer type, including legacy mouse events with no type. */
export function getPointerType(value: string): PointerType {
  switch (value) {
    case "mouse":
    case "pen":
    case "touch":
    case "keyboard":
    case "virtual": {
      return value;
    }

    default: {
      return "mouse";
    }
  }
}
