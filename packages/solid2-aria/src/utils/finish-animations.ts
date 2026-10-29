/** Run a completion callback only if all animations finish without cancellation. */
export async function finishAnimations(
  animations: readonly Animation[],
  onFinish: () => void,
  start?: void | Promise<void>
): Promise<void> {
  try {
    await Promise.all([
      start,
      ...animations.map(async (animation) => await animation.finished),
    ]);
    onFinish();
  } catch {
    // A cancelled animation does not complete the transition.
  }
}
