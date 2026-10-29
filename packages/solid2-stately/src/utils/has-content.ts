import type { Element as SolidElement } from "solid-js";

/** Collection descriptors use JavaScript truthiness to select optional JSX content. */
export const hasContent: (value: SolidElement) => boolean = Boolean;
