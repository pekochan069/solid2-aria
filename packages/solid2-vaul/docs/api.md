# API reference

`@solid2-aria/vaul` exports the `Drawer` namespace and each component as a named export: `Root`, `NestedRoot`, `Trigger`, `Portal`, `Overlay`, `Content`, `Handle`, `Close`, `Title`, and `Description`.

The stylesheet is available at `@solid2-aria/vaul/style.css` and `@solid2-aria/vaul/styles.css`. It is imported explicitly by the consumer. Browser and server exports are selected through the package's `browser` and default export conditions.

## Root and NestedRoot

`DrawerProps` and `DialogProps` describe the same props. `NestedRoot` requires a parent root and updates the parent drawer's scale during nested opening and dragging.

| Prop | Default | Behavior |
| --- | --- | --- |
| `open` | Uncontrolled | Controlled open state. |
| `defaultOpen` | `false` | Initial uncontrolled state. Skips the initial entry animation. |
| `onOpenChange` | None | Receives a requested open state. Controlled state waits for the parent to update `open`. |
| `onClose` | None | Runs when the drawer's actual state changes from open to closed. |
| `onAnimationEnd` | None | Receives the committed state after the 500 ms transition. Interrupted transitions cancel the prior callback. Reduced motion uses zero delay. |
| `direction` | `"bottom"` | `"top"`, `"bottom"`, `"left"`, or `"right"`. |
| `dismissible` | `true` | Allows Escape, outside interaction, the close component, and dragging to dismiss. Controlled `open` can close a non-dismissible drawer. |
| `modal` | `true` | Contains focus, hides outside content from assistive technology, and renders the overlay. With `false`, outside interaction leaves the drawer open. |
| `autoFocus` | `false` | Focuses the first available control on opening. |
| `handleOnly` | `false` | Restricts dragging to `Handle`. |
| `closeThreshold` | `0.25` | Fraction of the drawer dimension that a slow drag must cross to dismiss. Fast gestures also use velocity. |
| `scrollLockTimeout` | `100` | Milliseconds after content scrolling during which dragging is blocked. |
| `snapPoints` | None | Visible viewport fractions or pixel strings, ordered smallest first. A custom root container supplies the viewport dimension. |
| `activeSnapPoint` | First point | Controlled active snap point. |
| `setActiveSnapPoint` | None | Receives a requested active point, including a reset after exit. |
| `fadeFromIndex` | Last point | Overlay becomes fully opaque at this point and fades between it and the previous point. Requires `snapPoints`. |
| `snapToSequentialPoint` | `false` | Limits each gesture to adjacent points, including fast swipes. |
| `shouldScaleBackground` | `false` | Scales the element marked `data-vaul-drawer-wrapper`. |
| `setBackgroundColorOnScale` | `true` | Sets the body background to black while scaling. |
| `noBodyStyles` | `false` | Skips body styling and document scroll locking. Focus management remains active. |
| `disablePreventScroll` | `false` | Enables additional scroll locking when no overlay is mounted. An open modal overlay normally enables scroll locking. |
| `repositionInputs` | `true` | Resizes bottom drawers when the visual viewport reports an obscuring software keyboard. |
| `fixed` | `false` | Reduces drawer height rather than expanding it to the available keyboard viewport. |
| `preventScrollRestoration` | `false` | Skips Safari scroll restoration if the URL changed while open. |
| `container` | Document viewport | Container for portal mounting and snap geometry. Container resizing recalculates offsets. |
| `onDrag` | None | Receives the native pointer event and the dragged fraction. |
| `onRelease` | None | Receives the native pointer event and whether the gesture requests an open drawer. |

The underlying scroll and focus behavior comes from `@solid2-aria/core`. Mobile Safari positioning and visual-viewport adaptations are included. Real-device keyboard behavior depends on browser viewport reporting.

## Trigger and Close

These components render native buttons and accept Solid button attributes. `render` accepts the reactive button props and returns custom JSX. React `asChild` is replaced by this callback. A click handler can prevent the default drawer action.

The trigger exposes `aria-haspopup`, `aria-expanded`, `aria-controls`, and `data-state`. Buttons default to `type="button"`.

## Portal, Overlay, and Content

`Portal` accepts `container`, `forceMount`, and `children`. Its container overrides the root's portal container. Changing only the portal container does not change root snap geometry. Portals render after client settlement and are absent from server HTML.

`Overlay` and `Content` accept native Solid div attributes and `forceMount`. `Portal.forceMount` also keeps its overlay and content mounted while closed. Closed content has no active modal effects. Normal closing retains content for the exit transition.

`Content` renders `role="dialog"` with the IDs generated for `Title` and `Description`. It accepts these cancellable events:

| Event                  | Value                                           |
| ---------------------- | ----------------------------------------------- |
| `onOpenAutoFocus`      | Cancelable native `Event`.                      |
| `onCloseAutoFocus`     | Cancelable native `Event`.                      |
| `onEscapeKeyDown`      | Native `KeyboardEvent`.                         |
| `onPointerDownOutside` | `CustomEvent<{ originalEvent: PointerEvent }>`. |
| `onFocusOutside`       | `CustomEvent<{ originalEvent: FocusEvent }>`.   |
| `onInteractOutside`    | Either outside event.                           |

`Content` forwards `aria-label`, `aria-labelledby`, and `aria-describedby`, so callers can supply their own labels or omit a description with `aria-describedby={undefined}`. `Title` renders an `h2`; `Description` renders a paragraph.

Vaul-compatible attributes include `data-state`, `data-vaul-drawer`, `data-vaul-overlay`, `data-vaul-drawer-direction`, `data-vaul-snap-points`, `data-vaul-snap-points-overlay`, `data-vaul-custom-container`, `data-vaul-delayed-snap-points`, and `data-vaul-animate`. String-valued states use `"true"` and `"false"`.

## Handle

`Handle` accepts native div attributes and `preventCycle`. Tapping advances to the next snap point and dismisses from the last point if allowed. Without snap points, tapping dismisses. Long presses and drag gestures do not cycle points. `preventCycle` disables tap cycling while retaining dragging.

The handle is hidden from assistive technology. `Close` supplies the keyboard-accessible close control. Its inner span expands the pointer target to at least 44 pixels.

`data-vaul-no-drag` on an element or its ancestor excludes that content from gesture initiation. Scrollable content keeps native scrolling until the drawer claims a drag.
