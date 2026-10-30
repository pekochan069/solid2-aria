/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/kitchen-island.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { TimerIcon, ThermometerIcon, SunIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { hasKey } from "../../../lib/has-key";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../../registry/ui/item";
import { Slider } from "../../../registry/ui/slider";
import { Switch } from "../../../registry/ui/switch";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../registry/ui/toggle-group";
import { IconPlaceholder } from "../../_icons";

const SCENES = {
  cooking: { brightness: [90], colorTemp: [70], fade: [0], volume: [30] },
  dining: { brightness: [50], colorTemp: [40], fade: [60], volume: [20] },
  focus: { brightness: [100], colorTemp: [85], fade: [0], volume: [0] },
  nightlight: { brightness: [15], colorTemp: [20], fade: [80], volume: [0] },
} as const;

export function KitchenIsland() {
  const [enabled, setEnabled] = createSignal(true);
  const [scene, setScene] = createSignal("cooking");
  const [brightness, setBrightness] = createSignal([90]);
  const [colorTemp, setColorTemp] = createSignal([70]);
  const [volume, setVolume] = createSignal([30]);
  const [fade, setFade] = createSignal([0]);

  const handleSceneChange = (value: string) => {
    if (!hasKey(SCENES, value)) {
      return;
    }

    setScene(value);
    const preset = SCENES[value];
    setBrightness([...preset.brightness]);
    setColorTemp([...preset.colorTemp]);
    setVolume([...preset.volume]);
    setFade([...preset.fade]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kitchen Island</CardTitle>
        <CardDescription>Hue Color Ambient</CardDescription>
        <CardAction>
          <Switch
            isSelected={enabled()}
            onChange={(value) => {
              setEnabled(value);
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <span class="sr-only">Scenes</span>
          <ToggleGroup
            selectedKeys={[scene()]}
            onSelectionChange={(value) => {
              handleSceneChange(String([...value][0] ?? "cooking"));
            }}
            variant="outline"
            spacing={1}
            class="flex-wrap"
          >
            <ToggleGroupItem id="cooking" isDisabled={!enabled()}>
              Cooking
            </ToggleGroupItem>
            <ToggleGroupItem id="dining" isDisabled={!enabled()}>
              Dining
            </ToggleGroupItem>
            <ToggleGroupItem id="nightlight" isDisabled={!enabled()}>
              Nightlight
            </ToggleGroupItem>
            <ToggleGroupItem id="focus" isDisabled={!enabled()}>
              Focus
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ItemGroup>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <SunIcon />
            </ItemMedia>
            <ItemContent class="flex-row items-center gap-3">
              <ItemTitle class="shrink-0">Brightness</ItemTitle>
            </ItemContent>
            <ItemActions class="flex-1">
              <Slider
                value={brightness()}
                onChange={(value) => {
                  setBrightness(Array.isArray(value) ? [...value] : [value]);
                }}
                maxValue={100}
                isDisabled={!enabled()}
                class="w-full"
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <ThermometerIcon />
            </ItemMedia>
            <ItemContent class="flex-row items-center gap-3">
              <ItemTitle class="shrink-0">Color Temp</ItemTitle>
            </ItemContent>
            <ItemActions class="flex-1">
              <Slider
                value={colorTemp()}
                onChange={(value) => {
                  setColorTemp(Array.isArray(value) ? [...value] : [value]);
                }}
                maxValue={100}
                isDisabled={!enabled()}
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <IconPlaceholder
                lucide="Volume2Icon"
                tabler="IconVolume"
                hugeicons="VolumeHighIcon"
                phosphor="SpeakerHighIcon"
                remixicon="RiVolumeUpLine"
              />
            </ItemMedia>
            <ItemContent class="flex-row items-center gap-3">
              <ItemTitle class="shrink-0">Volume</ItemTitle>
            </ItemContent>
            <ItemActions class="flex-1">
              <Slider
                value={volume()}
                onChange={(value) => {
                  setVolume(Array.isArray(value) ? [...value] : [value]);
                }}
                maxValue={100}
                isDisabled={!enabled()}
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <TimerIcon />
            </ItemMedia>
            <ItemContent class="flex-row items-center gap-3">
              <ItemTitle class="shrink-0">Fade</ItemTitle>
            </ItemContent>
            <ItemActions class="flex-1">
              <Slider
                value={fade()}
                onChange={(value) => {
                  setFade(Array.isArray(value) ? [...value] : [value]);
                }}
                maxValue={100}
                isDisabled={!enabled()}
              />
            </ItemActions>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export default KitchenIsland;
