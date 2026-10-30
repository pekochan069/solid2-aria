/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/progress-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { onSettled, createSignal } from "solid-js";

import { Progress } from "../registry/ui/progress";

export default function ProgressDemo() {
  const [progress, setProgress] = createSignal(13);

  onSettled(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  });

  return <Progress aria-label="Loading" value={progress()} class="w-[60%]" />;
}
