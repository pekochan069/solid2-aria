/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/bar-visualizer.tsx.
 * Modified for Solid Aria: Solid 2 state and owner-scoped animation replace React refs and memo wrappers.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, For, onSettled } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../registry/ui/card";

export function BarVisualizerCard() {
  const [state, setState] = createSignal("speaking");
  const [frame, setFrame] = createSignal(0);
  onSettled(() => {
    const timer = setInterval(() => {
      setFrame((value) => value + 1);
    }, 160);

    return () => {
      clearInterval(timer);
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Frequency Visualizer</CardTitle>
        <CardDescription>
          Real-time frequency band visualization with animated state transitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          class="flex h-40 items-center justify-center gap-1.5"
          role="img"
          aria-label={`Audio visualizer: ${state()}`}
        >
          <For each={Array.from({ length: 20 }, (_, index) => index)}>
            {(index) => (
              <div
                class="bg-primary w-2 rounded-full transition-all duration-150"
                style={{
                  height: `${
                    15 +
                    Math.abs(Math.sin(index * 0.4 + frame() * 0.35)) *
                      (() => {
                        if (state() === "speaking") {
                          return 75;
                        }

                        if (state() === "listening") {
                          return 30;
                        }

                        return 10;
                      })()
                  }%`,
                }}
              />
            )}
          </For>
        </div>
      </CardContent>
      <CardFooter class="gap-2">
        <For each={["connecting", "listening", "speaking"]}>
          {(value) => (
            <Button
              size="sm"
              variant={state() === value ? "default" : "outline"}
              onClick={() => {
                setState(value);
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Button>
          )}
        </For>
      </CardFooter>
    </Card>
  );
}

export default BarVisualizerCard;
