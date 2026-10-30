/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/playground/page.tsx and components/{preset-save,preset-share,preset-selector,code-viewer,temperature-selector,maxlength-selector,top-p-selector}.tsx.
 * Modified for Solid Aria: Solid 2 playground state, native sliders, local preset saving and shareable URL, and accessible local Aria controls.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { EllipsisIcon, RotateCcwIcon } from "@lucide/solid";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import { Input } from "../../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../registry/ui/select";
import { Slider } from "../../registry/ui/slider";
import { Textarea } from "../../registry/ui/textarea";
import { models } from "./models";
import { PlaygroundModeIcon } from "./playground-mode-icon";
import { presets } from "./presets";

export function Playground() {
  const [mode, setMode] = createSignal("complete");
  const [model, setModel] = createSignal("text-davinci-003");
  const [temperature, setTemperature] = createSignal(0.56);
  const [maxLength, setMaxLength] = createSignal(256);
  const [topP, setTopP] = createSignal(0.9);
  const [prompt, setPrompt] = createSignal("");
  const [instructions, setInstructions] = createSignal("");
  const [preset, setPreset] = createSignal("");

  const [customPresets, setCustomPresets] = createSignal<
    { name: string; prompt: string }[]
  >([]);

  const [presetName, setPresetName] = createSignal("");
  const [result, setResult] = createSignal("");
  const [notice, setNotice] = createSignal("");
  const [viewCode, setViewCode] = createSignal(false);

  const code = createMemo(() =>
    JSON.stringify(
      {
        max_tokens: maxLength(),
        model: model(),
        prompt: prompt(),
        temperature: temperature(),
        top_p: topP(),
      },
      null,
      2
    )
  );

  onSettled(() => {
    const params = new URLSearchParams(location.search);
    const shared = params.get("prompt");

    if (shared !== null) {
      setPrompt(shared);
    }

    try {
      const saved = localStorage.getItem("shadcn-solid2-playground-presets");

      if (saved !== null && saved !== "") {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCustomPresets(
            parsed.filter(
              (item: unknown): item is { name: string; prompt: string } =>
                item !== null &&
                typeof item === "object" &&
                "name" in item &&
                typeof item.name === "string" &&
                "prompt" in item &&
                typeof item.prompt === "string"
            )
          );
        }
      }
    } catch {
      /* Presets remain available for the current session. */
    }
  });

  function savePreset() {
    const name = presetName().trim();

    if (!name) {
      setNotice("Enter a name for your preset.");

      return;
    }

    const next = [
      ...customPresets().filter((item) => item.name !== name),
      { name, prompt: prompt() },
    ];

    setCustomPresets(next);

    try {
      localStorage.setItem(
        "shadcn-solid2-playground-presets",
        JSON.stringify(next)
      );
    } catch {
      //
    }

    setNotice(`Saved “${name}”.`);
  }

  async function share() {
    const url = new URL(location.href);
    url.searchParams.set("prompt", prompt());

    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Share link copied.");
    } catch {
      setNotice(url.toString());
    }
  }

  return (
    <>
      <div class="showcase-mobile-preview">
        <img
          src="/examples/playground-light.png"
          width="1280"
          height="916"
          alt="Playground"
          class="gallery-light"
        />
        <img
          src="/examples/playground-dark.png"
          width="1280"
          height="916"
          alt="Playground"
          class="gallery-dark"
        />
      </div>
      <section class="showcase-playground">
        <header class="showcase-row">
          <h1>Playground</h1>
          <div class="showcase-toolbar">
            <Select
              class="playground-preset"
              aria-label="Load a preset"
              value={preset() || null}
              onChange={(value) => {
                const name = String(value ?? "");
                setPreset(name);

                const custom = customPresets().find(
                  (item) => item.name === name
                );

                setPrompt(custom?.prompt ?? name);
              }}
            >
              <SelectTrigger>{preset() || "Load a preset..."}</SelectTrigger>
              <SelectContent>
                <For each={presets}>
                  {(item) => (
                    <SelectItem id={item.name}>{item.name}</SelectItem>
                  )}
                </For>
                <For each={customPresets()}>
                  {(item) => (
                    <SelectItem id={item.name}>{item.name}</SelectItem>
                  )}
                </For>
              </SelectContent>
            </Select>
            <details class="showcase-save">
              <summary>Save</summary>
              <div>
                <label for="preset-name">Preset name</label>
                <Input
                  id="preset-name"
                  value={presetName()}
                  onInput={(event) => {
                    setPresetName(event.currentTarget.value);
                  }}
                />
                <Button onPress={savePreset}>Save preset</Button>
              </div>
            </details>
            <Button
              variant="secondary"
              onPress={() => {
                setViewCode((value) => !value);
              }}
            >
              View code
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                void share();
              }}
            >
              Share
            </Button>
            <details class="showcase-save playground-actions">
              <summary aria-label="Preset actions">
                <EllipsisIcon size={16} />
              </summary>
              <div>
                <Button
                  variant="ghost"
                  onPress={() => {
                    setPreset("");
                    setPrompt("");
                    setResult("");
                  }}
                >
                  Delete preset
                </Button>
              </div>
            </details>
          </div>
        </header>
        <div class="showcase-playground-grid">
          <div class="showcase-playground-editor">
            <label for="playground-prompt" class="sr-only">
              Prompt
            </label>
            <Textarea
              id="playground-prompt"
              placeholder={(() => {
                if (mode() === "complete") {
                  return "Write a tagline for an ice cream shop";
                }

                if (mode() === "insert") {
                  return "We're writing to [insert]. Congrats from OpenAI!";
                }

                return "We is going to the market.";
              })()}
              value={prompt()}
              onInput={(event) => {
                setPrompt(event.currentTarget.value);
              }}
            />
            <Show when={mode() === "edit"}>
              <label for="playground-instructions">Instructions</label>
              <Textarea
                id="playground-instructions"
                placeholder="Fix the grammar."
                value={instructions()}
                onInput={(event) => {
                  setInstructions(event.currentTarget.value);
                }}
              />
            </Show>
            <Show when={result()}>
              <output class="showcase-playground-result">{result()}</output>
            </Show>
            <div class="showcase-toolbar">
              <Button
                onPress={() => {
                  if (!prompt().trim()) {
                    setNotice("Enter a prompt to preview your request.");

                    return;
                  }

                  setResult(
                    `Request preview · ${model()}\n${prompt()}${instructions() ? `\nInstructions: ${instructions()}` : ""}`
                  );
                  setNotice(
                    "Request prepared. Connect your own model endpoint to generate a completion."
                  );
                }}
              >
                Submit
              </Button>
              <Button
                variant="secondary"
                aria-label="Clear output"
                onPress={() => {
                  setResult("");
                  setNotice("");
                }}
              >
                <RotateCcwIcon size={16} />
              </Button>
            </div>
            <p role="status" class="showcase-small">
              {notice()}
            </p>
            <Show when={viewCode()}>
              <pre class="showcase-code">
                <code>{code()}</code>
              </pre>
            </Show>
          </div>
          <aside class="showcase-playground-settings">
            <div class="playground-setting">
              <label>Mode</label>
              <div class="showcase-segment">
                <For each={["complete", "insert", "edit"]}>
                  {(value) => (
                    <button
                      type="button"
                      aria-label={value}
                      aria-pressed={mode() === value ? "true" : "false"}
                      onClick={() => {
                        setMode(value);
                        setResult("");
                      }}
                    >
                      <PlaygroundModeIcon mode={value} />
                    </button>
                  )}
                </For>
              </div>
            </div>
            <div class="playground-setting">
              <label for="playground-model">Model</label>
              <Select
                id="playground-model"
                value={model()}
                onChange={(value) => {
                  if (value !== null) {
                    setModel(String(value));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <For each={models}>
                    {(item) => (
                      <SelectItem id={item.name}>{item.name}</SelectItem>
                    )}
                  </For>
                </SelectContent>
              </Select>
            </div>
            <div class="playground-setting playground-parameter">
              <label for="temperature">
                Temperature <output>{temperature()}</output>
              </label>
              <Slider
                aria-label="Temperature"
                id="temperature"
                minValue={0}
                maxValue={1}
                step={0.01}
                value={temperature()}
                onChange={(v) => {
                  setTemperature(v);
                }}
              />
            </div>
            <div class="playground-setting playground-parameter">
              <label for="maximum-length">
                Maximum Length <output>{maxLength()}</output>
              </label>
              <Slider
                aria-label="Maximum Length"
                id="maximum-length"
                minValue={1}
                maxValue={4000}
                value={maxLength()}
                onChange={(v) => {
                  setMaxLength(v);
                }}
              />
            </div>
            <div class="playground-setting playground-parameter">
              <label for="top-p">
                Top P <output>{topP()}</output>
              </label>
              <Slider
                aria-label="Top P"
                id="top-p"
                minValue={0}
                maxValue={1}
                step={0.01}
                value={topP()}
                onChange={(v) => {
                  setTopP(v);
                }}
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
