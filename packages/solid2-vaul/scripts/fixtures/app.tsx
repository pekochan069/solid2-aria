import { render } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Drawer } from "../../dist/browser/index.js";
import type { DrawerDirection } from "../../src/types";

const params = new URLSearchParams(location.search);
const requestedDirection = params.get("direction");

const direction: DrawerDirection =
  requestedDirection === "top" ||
  requestedDirection === "left" ||
  requestedDirection === "right"
    ? requestedDirection
    : "bottom";

const withSnaps = params.has("snaps");

function App() {
  const [open, setOpen] = createSignal(false);
  const [snap, setSnap] = createSignal<number | string | null>(0.25);
  const [nested, setNested] = createSignal(false);

  return (
    <>
      <div data-vaul-drawer-wrapper>
        <button data-outside>Outside</button>
        <Drawer.Root
          direction={direction}
          open={open()}
          onOpenChange={(value) => {
            setOpen(value);
          }}
          modal={!params.has("nonmodal")}
          handleOnly={params.has("handleOnly")}
          dismissible={!params.has("nondismissible")}
          shouldScaleBackground={params.has("scale")}
          snapPoints={withSnaps ? [0.25, 0.5, 1] : undefined}
          activeSnapPoint={withSnaps ? snap() : undefined}
          setActiveSnapPoint={(point) => {
            setSnap(point);
          }}
          autoFocus
        >
          <Drawer.Trigger data-trigger>Open drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay class="overlay" />
            <Drawer.Content
              class="drawer"
              style={withSnaps ? { height: "100%" } : undefined}
            >
              <Drawer.Handle />
              <Drawer.Title>Drawer title</Drawer.Title>
              <Drawer.Description>Drawer description</Drawer.Description>
              <input aria-label="Name" />
              <div data-scroll style={{ height: "90px", overflow: "auto" }}>
                <div style={{ height: "600px" }}>Scrollable contents</div>
              </div>
              <button data-no-drag data-vaul-no-drag>
                No drag
              </button>
              <Drawer.NestedRoot
                open={nested()}
                onOpenChange={(value) => {
                  setNested(value);
                }}
                autoFocus
              >
                <Drawer.Trigger data-nested-trigger>Open nested</Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay class="overlay nested-overlay" />
                  <Drawer.Content class="drawer nested" data-child>
                    <Drawer.Title>Nested title</Drawer.Title>
                    <Drawer.Description>Nested description</Drawer.Description>
                    <Drawer.Close>Close nested</Drawer.Close>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.NestedRoot>
              <Drawer.Close data-close>Close drawer</Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
        <output data-snap>{snap()}</output>
        <div style={{ height: "2000px" }}>Page contents</div>
      </div>
    </>
  );
}

const host = document.querySelector("#app");

if (!host) {
  throw new Error("Missing app host");
}

render(() => <App />, host);
