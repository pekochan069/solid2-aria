/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/live-waveform.tsx.
 * Modified for Solid Aria: Solid 2 signals, native microphone analysis, and owner-scoped cleanup replace React refs and effects.
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

export function LiveWaveformCard() {
  const [active, setActive] = createSignal(false);
  const [processing, setProcessing] = createSignal(true);
  const [mode, setMode] = createSignal("static");

  const [levels, setLevels] = createSignal<number[]>(
    Array.from({ length: 48 }, () => 0.1)
  );

  const [error, setError] = createSignal("");
  let stream: MediaStream | undefined;
  let context: AudioContext | undefined;
  let frame: number | undefined;
  let request = 0;

  function stop() {
    request += 1;

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    stream = undefined;

    if (frame !== undefined) {
      cancelAnimationFrame(frame);
    }

    if (context) {
      void context.close();
    }

    context = undefined;
    setActive(false);
  }

  async function start() {
    if (active()) {
      stop();

      return;
    }

    request += 1;
    const current = request;

    try {
      const next = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (current !== request) {
        for (const track of next.getTracks()) {
          track.stop();
        }

        return;
      }

      stream = next;
      context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      context.createMediaStreamSource(stream).connect(analyser);
      const values = new Uint8Array(analyser.frequencyBinCount);
      setActive(true);
      setProcessing(false);
      setError("");

      const tick = () => {
        analyser.getByteFrequencyData(values);
        setLevels(
          Array.from(values.slice(0, 48), (value) =>
            Math.max(0.05, value / 255)
          )
        );
        frame = requestAnimationFrame(tick);
      };

      tick();
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Microphone unavailable"
      );
    }
  }

  onSettled(() => {
    let phase = 0;

    const timer = setInterval(() => {
      if (processing()) {
        phase += 0.4;
        setLevels(
          Array.from(
            { length: 48 },
            (_, index) => 0.1 + Math.abs(Math.sin(index * 0.4 + phase)) * 0.6
          )
        );
      }
    }, 160);

    return () => {
      clearInterval(timer);
      stop();
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Audio Waveform</CardTitle>
        <CardDescription>
          Real-time microphone input visualization with audio reactivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          class="flex h-20 items-center gap-0.5 overflow-hidden"
          role="img"
          aria-label="Audio waveform"
        >
          <For each={levels()}>
            {(level) => (
              <div
                class="bg-muted-foreground flex-1 rounded-full transition-all duration-150"
                style={{ height: `${Math.max(4, level * 80)}px` }}
              />
            )}
          </For>
        </div>
        <p role="status" class="text-destructive text-xs">
          {error()}
        </p>
      </CardContent>
      <CardFooter class="flex-wrap gap-2">
        <Button
          size="sm"
          variant={active() ? "default" : "outline"}
          onClick={() => {
            void start();
          }}
        >
          {active() ? "Stop" : "Start"} Listening
        </Button>
        <Button
          size="sm"
          variant={processing() ? "default" : "outline"}
          onClick={() => {
            stop();
            setProcessing((value) => !value);
          }}
        >
          {processing() ? "Stop" : "Start"} Processing
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setMode((value) => (value === "static" ? "scrolling" : "static"));
          }}
        >
          {mode() === "static" ? "Static" : "Scrolling"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LiveWaveformCard;
