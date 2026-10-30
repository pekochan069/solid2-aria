import { createSignal } from "solid-js";

export function MDXCounter(props: { initialCount: number }) {
  const [count, setCount] = createSignal(() => props.initialCount);

  return (
    <button
      class="rounded border px-3 py-2"
      onClick={() => {
        setCount((value) => value + 1);
      }}
      type="button"
    >
      Count: {count()}
    </button>
  );
}
