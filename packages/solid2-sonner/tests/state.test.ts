import { afterEach, test } from "bun:test";
import { strict as assert } from "node:assert";
import { setTimeout as delay } from "node:timers/promises";

import { toast, ToastState } from "../src/state";

// RAF is absent in Bun; preserve its numeric IDs and cancellable deferred callbacks.
const frames = new Set<number>();
let nextFrameId = 0;

/* eslint-disable promise/prefer-await-to-callbacks -- RAF's browser contract requires deferred callbacks. */
async function runFrame(id: number, run: FrameRequestCallback) {
  await delay(0);

  if (frames.delete(id)) {
    run(Date.now());
  }
}

globalThis.requestAnimationFrame = (callback) => {
  nextFrameId += 1;
  const id = nextFrameId;
  frames.add(id);
  void runFrame(id, callback);

  return id;
};

globalThis.cancelAnimationFrame = (id) => {
  frames.delete(id);
};

/* eslint-enable promise/prefer-await-to-callbacks */
afterEach(() => {
  toast.dismiss();
});

test("updates one ID, resets type, and cancels pending dismissal", async () => {
  const id = toast.loading("Loading", { id: "same" });
  toast.success("Done", { id });
  toast.dismiss(id);
  toast("Updated", { id });
  await delay(10);
  assert.equal(toast.getToasts().length, 1);
  assert.equal(toast.getToasts()[0]?.title, "Updated");
  assert.equal(toast.getToasts()[0]?.type, undefined);
});

test("subscription replays active toasts and unsubscribes", () => {
  toast("Before mount");
  const received: unknown[] = [];

  const unsubscribe = ToastState.subscribe((item) => {
    received.push(item);
  });

  assert.equal(received.length, 1);
  unsubscribe();
  toast("After unmount");
  assert.equal(received.length, 1);
});

test("promise success, extended result, rejection, and unwrap", async () => {
  const result = toast.promise(Promise.resolve(42), {
    loading: "Loading",
    success: (value) => ({ description: "Settled", message: `Value ${value}` }),
  });

  assert.equal(await result?.unwrap(), 42);
  assert.equal(toast.getToasts().at(-1)?.type, "success");
  assert.equal(toast.getToasts().at(-1)?.description, "Settled");
  const error = new Error("Failure");

  const rejected = toast.promise(Promise.reject(error), {
    error: (err) => (err instanceof Error ? err.message : String(err)),
    loading: "Loading",
  });

  assert.ok(rejected);
  await assert.rejects(rejected.unwrap(), /Failure/u);
  assert.equal(toast.getToasts().at(-1)?.type, "error");
});

test("promise HTTP and Error results, formatter failure, and finally", async () => {
  let finalized = 0;

  const http = toast.promise(Promise.resolve({ ok: false, status: 503 }), {
    error: String,
    finally: () => {
      finalized += 1;
    },
    loading: "Loading",
  });

  assert.deepEqual(await http?.unwrap(), { ok: false, status: 503 });
  assert.equal(toast.getToasts().at(-1)?.title, "HTTP error! status: 503");
  assert.equal(finalized, 1);

  const error = new Error("Resolved error");

  const resolvedError = toast.promise(Promise.resolve(error), {
    error: (value) => (value instanceof Error ? value.message : String(value)),
    loading: "Loading",
  });

  assert.equal(await resolvedError?.unwrap(), error);
  assert.equal(toast.getToasts().at(-1)?.type, "error");

  const formatterError = toast.promise(Promise.resolve(42), {
    error: "Formatting failed",
    loading: "Loading",
    success: () => {
      throw new Error("Formatter failed");
    },
  });

  assert.ok(formatterError);
  await assert.rejects(formatterError.unwrap(), /Formatter failed/u);
  assert.equal(toast.getToasts().at(-1)?.title, "Formatting failed");
});

test("promise without loading unwraps and loading-only toast dismisses", async () => {
  const success = toast.promise(async () => await delay(0, 42), {
    success: "Done",
  });

  assert.equal(await success?.unwrap(), 42);
  assert.equal(toast.getToasts().at(-1)?.title, "Done");

  const loading = toast.promise(Promise.resolve(7), { loading: "Loading" });
  assert.equal(await loading?.unwrap(), 7);
  await delay(10);
  assert.equal(
    toast.getToasts().some((item) => item.title === "Loading"),
    false
  );
});

test("recreation after delivered dismissal drops stale options", async () => {
  const id = toast("Old", {
    action: { label: "Old action", onClick: () => {} },
    id: "recreated",
  });

  toast.dismiss(id);
  await delay(10);
  toast("New", { id });
  assert.equal(toast.getToasts().at(-1)?.title, "New");
  assert.equal(toast.getToasts().at(-1)?.action, undefined);
});
