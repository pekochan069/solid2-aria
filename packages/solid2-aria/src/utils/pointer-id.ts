/** Read the identifier shared by native pointer and touch interaction events. */
export function getPointerId(
  event: PointerEvent | TouchEvent | MouseEvent
): number | undefined {
  if ("pointerId" in event) {
    return event.pointerId;
  }

  if ("changedTouches" in event) {
    return event.changedTouches[0]?.identifier;
  }

  return undefined;
}
