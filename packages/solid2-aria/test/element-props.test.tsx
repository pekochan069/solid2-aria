import { expect, test } from "bun:test";

import { render } from "@solidjs/web";
import { flush } from "solid-js";

import { ElementProps } from "../src/utils/element-props";

test("applying trigger behavior alongside overlay content mounts children once", async () => {
  let mounts = 0;

  function Trigger() {
    mounts += 1;

    return <button>Action</button>;
  }

  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <ElementProps value={{ "aria-label": "Trigger action" }}>
        <Trigger />
        <span>Overlay content</span>
      </ElementProps>
    ),
    host
  );

  try {
    flush();
    await Promise.resolve();
    flush();
    expect(mounts).toBe(1);
    expect(host.querySelectorAll("button").length).toBe(1);
    expect(host.querySelector("button")?.getAttribute("aria-label")).toBe(
      "Trigger action"
    );
  } finally {
    dispose();
    host.remove();
    flush();
  }
});
