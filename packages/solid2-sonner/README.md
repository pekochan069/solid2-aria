# @solid2-aria/sonner

Toast notifications for Solid 2, adapted from solid-sonner and Sonner. Requires `solid-js` and `@solidjs/web` 2.0.0-rc.17 or later in the Solid 2 release line.

## Installation

```sh
bun add @solid2-aria/sonner solid-js@next @solidjs/web@next
```

## Usage

Import the stylesheet once in your app entry point, and mount a `Toaster`:

```tsx
import { Toaster, toast } from "@solid2-aria/sonner";

import "@solid2-aria/sonner/styles.css";

export default function App() {
  return (
    <>
      <button onClick={() => toast.success("Saved")}>Save</button>
      <Toaster theme="system" richColors closeButton />
    </>
  );
}
```

Mount one default toaster per application. To route notifications to another toaster, use `<Toaster id="editor" />` with `toast("Saved", { toasterId: "editor" })`.

The package exports `Toaster`, `toast`, `useSonner`, and public types including `ToasterProps`, `ExternalToast`, and `PromiseData`. It supports actions, six positions, swipe dismissal, paused timers, custom icons, and style overrides.

Update or dismiss an existing toast with its ID:

```tsx
const id = toast.loading("Saving");
toast.success("Saved", { id });
toast.dismiss(id);

toast.promise(saveChanges(), {
  loading: "Saving",
  success: "Saved",
  error: "Could not save",
});

toast.custom((id) => (
  <button onClick={() => toast.dismiss(id)}>Dismiss</button>
));
```

Call `useSonner()` inside a Solid owner to observe active toasts through `toasts()`:

```tsx
import { useSonner } from "@solid2-aria/sonner";

function NotificationCount() {
  const { toasts } = useSonner();
  return <span>{toasts().length} notifications</span>;
}
```

The export selects compiled browser code for browser bundles and SSR code for server bundles. SSR and hydration are checked with Solid's rendering APIs. Toast state is module scoped, so call `toast()` from client interactions rather than request-scoped server code.

Run verification from `packages/solid2-sonner`:

```sh
bun run build
bun run check-types
bun test
bun run check-build
bun run check
```

`check-build` copies shipped files into a temporary consumer and checks exports, CSS, types, SSR, DOM hydration, and toast interactions. DOM checks use Happy DOM.

Solid Aria contributions use the [MIT license](./LICENSE). The original MIT licenses are in [SOLID-SONNER-LICENSE.md](./SOLID-SONNER-LICENSE.md) for solid-sonner and [SONNER-LICENSE.md](./SONNER-LICENSE.md) for Sonner. [NOTICE.txt](./NOTICE.txt) records source provenance and modifications.
