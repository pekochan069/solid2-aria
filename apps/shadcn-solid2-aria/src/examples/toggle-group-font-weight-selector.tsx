/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/toggle-group-font-weight-selector.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Field, FieldDescription, FieldLabel } from "../registry/ui/field";
import { ToggleGroup, ToggleGroupItem } from "../registry/ui/toggle-group";

export function ToggleGroupFontWeightSelector() {
  const [fontWeight, setFontWeight] = createSignal("normal");

  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup
        selectedKeys={[fontWeight()]}
        onSelectionChange={(value) => {
          setFontWeight(String([...value][0] ?? ""));
        }}
        variant="outline"
        spacing={2}
        size="lg"
      >
        <ToggleGroupItem
          id="light"
          aria-label="Light"
          class="flex size-16 flex-col items-center justify-center rounded-xl"
        >
          <span class="text-2xl leading-none font-light">Aa</span>
          <span class="text-muted-foreground text-xs">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          id="normal"
          aria-label="Normal"
          class="flex size-16 flex-col items-center justify-center rounded-xl"
        >
          <span class="text-2xl leading-none font-normal">Aa</span>
          <span class="text-muted-foreground text-xs">Normal</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          id="medium"
          aria-label="Medium"
          class="flex size-16 flex-col items-center justify-center rounded-xl"
        >
          <span class="text-2xl leading-none font-medium">Aa</span>
          <span class="text-muted-foreground text-xs">Medium</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          id="bold"
          aria-label="Bold"
          class="flex size-16 flex-col items-center justify-center rounded-xl"
        >
          <span class="text-2xl leading-none font-bold">Aa</span>
          <span class="text-muted-foreground text-xs">Bold</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>
        Use{" "}
        <code class="bg-muted rounded-md px-1 py-0.5 font-mono">
          font-{fontWeight()}
        </code>{" "}
        to set the font weight.
      </FieldDescription>
    </Field>
  );
}

export default ToggleGroupFontWeightSelector;
