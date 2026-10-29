/** Read whether a prior native event handler stopped bubbling. */
export function isPropagationStopped(event: Event): boolean {
  // oxlint-disable-next-line typescript/no-deprecated -- cancelBubble is the native read API for whether stopPropagation was called.
  return event.cancelBubble;
}
