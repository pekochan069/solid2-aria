/** Read a dynamic property at the component or browser API boundary. */
export function readProperty(
  // oxlint-disable-next-line anti-slop/no-object-parameters -- Parse dynamic browser extensions and generic component props at this boundary.
  source: object,
  key: PropertyKey
) {
  // oxlint-disable-next-line anti-slop/no-reflect-get -- Browser extensions and generic component props have keys outside their declared interfaces.
  const value: unknown = Reflect.get(source, key);

  return value;
}
