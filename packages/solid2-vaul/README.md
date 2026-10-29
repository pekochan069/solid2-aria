# @solid2-aria/vaul

Build unstyled, draggable drawers with Solid 2. This package ports [Vaul](https://github.com/emilkowalski/vaul) 1.1.2 and uses Solid2 Aria for focus management and scroll prevention.

## Add a drawer

Install the package alongside Solid 2 and its web renderer:

```sh
bun add @solid2-aria/vaul solid-js@^2.0.0-rc.17 @solidjs/web@^2.0.0-rc.17
```

Set `jsxImportSource` to `@solidjs/web` in your TypeScript configuration. Import the drawer stylesheet once in your application:

```tsx
import { Drawer } from "@solid2-aria/vaul";

import "@solid2-aria/vaul/style.css";

export function Example() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open settings</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay class="drawer-overlay" />
        <Drawer.Content class="drawer-content">
          <Drawer.Handle />
          <Drawer.Title>Settings</Drawer.Title>
          <Drawer.Description>Change your preferences.</Drawer.Description>
          <Drawer.Close>Done</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Add your layout and colors. The package stylesheet supplies gestures, directional animations, and the handle appearance:

```css
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgb(0 0 0 / 40%);
}

.drawer-content {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 41;
  box-sizing: border-box;
  max-height: 90dvh;
  overflow-y: auto;
  padding: 24px;
  border-radius: 12px 12px 0 0;
  background: white;
  color: black;
}
```

Click **Open settings**, drag toward the bottom edge, or press Escape to close the drawer. To use another direction, set `direction="top"`, `"left"`, or `"right"` on `Drawer.Root` and position your content against that edge.

## Control opening and snap points

Pass signal values at the JSX boundary. Snap points are visible viewport fractions or pixel strings, ordered from the smallest visible portion to the largest. Give snap-point content the full height or width of its viewport or container:

```tsx
import { Drawer } from "@solid2-aria/vaul";
import type { SnapPoint } from "@solid2-aria/vaul";
import { createSignal } from "solid-js";

export function SnappingDrawer() {
  const [open, setOpen] = createSignal(false);
  const [snap, setSnap] = createSignal<SnapPoint | null>(0.25);

  return (
    <Drawer.Root
      open={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      snapPoints={[0.25, 0.5, 1]}
      activeSnapPoint={snap()}
      setActiveSnapPoint={(value) => {
        setSnap(value);
      }}
      fadeFromIndex={2}
    >
      <Drawer.Trigger>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay class="drawer-overlay" />
        <Drawer.Content
          class="drawer-content"
          style={{ height: "100dvh", "max-height": "100dvh" }}
        >
          <Drawer.Handle />
          <Drawer.Title>Choose a height</Drawer.Title>
          <Drawer.Description>
            Drag or tap the handle to change the snap point.
          </Drawer.Description>
          <Drawer.Close>Done</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Set `snapToSequentialPoint` to keep each gesture within the adjacent snap points. Add `data-vaul-no-drag` to controls that must not initiate dragging. Set `handleOnly` on the root to restrict dragging to `Drawer.Handle`.

For a nested drawer, put `Drawer.NestedRoot` inside the parent content and give it its own trigger, portal, overlay, and content. Use higher stacking levels for the nested overlay and content.

To scale the page while a drawer opens, add `data-vaul-drawer-wrapper` to the page container and set `shouldScaleBackground` on the root. Keep the portal outside that wrapper.

## Compose a custom trigger

Use `render` on `Drawer.Trigger` or `Drawer.Close` in place of React's `asChild`. Spread the supplied props onto your button to retain its ref, events, and ARIA attributes:

```tsx
<Drawer.Trigger
  render={(attributes) => (
    <button {...attributes} class="primary-button">
      Open
    </button>
  )}
/>
```

Use Solid's `class` prop and callback refs. Content event handlers can call `preventDefault()` to cancel Escape dismissal, outside dismissal, or automatic focus.

Portals mount after the client settles, so server rendering and hydration do not access `document`. For server-rendered inline content, omit `Drawer.Portal`.

## Verify the package

From this directory:

```sh
bun install
bun run check-types
bun test --conditions=browser --conditions=development --preload ./tests/setup.ts
bun run check
bun run build
bun run check-build
bunx playwright install chromium
bun run check-browser
```

`check-build` installs only the shipped files into a temporary consumer and checks server rendering, hydration, exports, and consumer types. `check-browser` drives the built package in Chromium.

See the [API reference](docs/api.md) for defaults and component props. The upstream revision, source attribution, and modifications are recorded in [NOTICE.txt](NOTICE.txt). Solid Aria contributions use the [MIT license](LICENSE). Vaul's original MIT license is preserved in [VAUL-LICENSE](VAUL-LICENSE).
