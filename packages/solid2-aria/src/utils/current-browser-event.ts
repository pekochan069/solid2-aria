/** Recover the native event while compatibility callbacks have only a synthesized press event. */
export function getCurrentBrowserEvent(): Event | undefined {
  // oxlint-disable-next-line typescript/no-deprecated -- Legacy form reset detection and press adapters require the browser's active native event.
  return window.event;
}
