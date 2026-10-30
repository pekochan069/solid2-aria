/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library/index.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, createMemo, Show } from "solid-js";

import { Separator } from "../../../../registry/ui/separator";
import { AssetDetails } from "./components/asset-details";
import { AssetGrid } from "./components/asset-grid";
import { PreviewHeader } from "./components/preview-header";
import { ASSETS } from "./data";

export function MediaLibrary() {
  const [selectedId, setSelectedId] = createSignal<string>("1");

  const selectedAsset = createMemo(
    () =>
      ASSETS.find((asset) => asset.id === selectedId()) ??
      ASSETS.find((asset) => asset.id === "1")
  );

  return (
    <div
      data-preview="media-library"
      class="preview theme-taupe bg-muted ring-foreground/5 @container/preview w-full flex-1 pt-4 font-sans ring-1 [--gap:--spacing(4)] sm:pt-0 md:[--gap:--spacing(6)] xl:[--gap:--spacing(8)] 2xl:py-8 **:[.container]:px-(--gap)"
    >
      <PreviewHeader />
      <Separator class="hidden sm:block" />
      <div class="container grid grid-cols-1 items-start gap-(--gap) py-(--gap) xl:grid-cols-[minmax(0,1fr)_320px]">
        <AssetGrid
          selectedId={selectedId()}
          onSelect={(value) => {
            setSelectedId(value);
          }}
        />
        <Show when={selectedAsset()}>
          {(asset) => <AssetDetails asset={asset()} />}
        </Show>
      </div>
    </div>
  );
}
