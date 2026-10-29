/*!
 * Derived from solid-sonner (https://github.com/wobsoriano/solid-sonner), src/state.ts.
 * Copyright (c) 2022 Robert Soriano <https://github.com/wobsoriano>
 * Derived from Sonner (https://github.com/emilkowalski/sonner), src/state.ts.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 types, reactivity, lifecycle, and package integration.
 * MIT licensed. See LICENSE, SOLID-SONNER-LICENSE.md, SONNER-LICENSE.md, and NOTICE.txt in the package root.
 */

import type { JSX } from "@solidjs/web";

import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastContent,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from "./types";

let toastsCounter = 1;

// Amount of toasts kept in `toast.getHistory()`. Dismissed toasts above this
// limit are dropped so long-running apps don't hold on to them forever.
const MAX_HISTORY_SIZE = 100;

// `custom` needs the same id `create` would pick, as it hands it to the JSX callback.
function getToastId(data?: { id?: number | string }): number | string {
  if (data?.id !== undefined && data.id !== "") {
    return data.id;
  }

  const id = toastsCounter;
  toastsCounter += 1;

  return id;
}

// This guard parses duck-typed HTTP results at the promise boundary, including response-like mocks.
/* eslint-disable anti-slop/no-runtime-typeof */
function isHttpResponse(
  data: unknown
): data is Pick<Response, "ok" | "status"> {
  return (
    typeof data === "object" &&
    data !== null &&
    "ok" in data &&
    typeof data.ok === "boolean" &&
    "status" in data &&
    typeof data.status === "number"
  );
}
/* eslint-enable anti-slop/no-runtime-typeof */

function getPromiseSettings(
  value: JSX.Element | PromiseIExtendedResult
): PromiseIExtendedResult {
  // eslint-disable-next-line anti-slop/no-runtime-typeof -- Typed callback result: distinguish settings objects from renderable values.
  return typeof value === "object" && value !== null && "message" in value
    ? value
    : { message: value };
}

function isValidElement(value: unknown): value is Node {
  return globalThis.Node !== undefined && value instanceof Node;
}

class Observer {
  subscribers: ((toast: ToastT | ToastToDismiss) => void)[];
  toasts: ToastT[];
  dismissedToasts: Set<string | number>;
  private readonly pendingDismissals: Map<string | number, number>;

  constructor() {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
    this.pendingDismissals = new Map();
  }

  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    // A toast can be created before the `Toaster` had a chance to subscribe,
    // e.g. when it's called above the `Toaster` in the tree. Replay whatever
    // is still active so it doesn't get lost.
    for (const activeToast of this.getActiveToasts()) {
      subscriber(activeToast);
    }

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    for (const subscriber of this.subscribers) {
      subscriber(data);
    }
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
    this.trimHistory();
  };

  // Keeps the history bounded without ever dropping a toast that's still on screen.
  private readonly trimHistory = () => {
    let toRemove = this.toasts.length - MAX_HISTORY_SIZE;

    if (toRemove <= 0) {
      return;
    }

    this.toasts = this.toasts.filter((toast) => {
      if (toRemove > 0 && this.dismissedToasts.has(toast.id)) {
        this.dismissedToasts.delete(toast.id);
        toRemove -= 1;

        return false;
      }

      return true;
    });
  };

  create = (
    data: ExternalToast & {
      message?: ToastContent;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: JSX.Element;
    }
  ) => {
    const { message, ...rest } = data;
    const id = getToastId(data);

    // Cancel a dismissal that hasn't reached the subscribers yet: the toast is
    // still on screen, so this updates it. Otherwise creating a toast right
    // after dismissing the same id lets that dismissal remove the new one.
    const pendingDismissal = this.pendingDismissals.get(id);

    if (pendingDismissal !== undefined) {
      cancelAnimationFrame(pendingDismissal);
      this.pendingDismissals.delete(id);
      this.dismissedToasts.delete(id);
    }

    const wasDismissed = this.dismissedToasts.has(id);

    const dismissible = data.dismissible ?? true;

    if (wasDismissed) {
      this.dismissedToasts.delete(id);
      // The previous toast with this id is gone, so this is a brand new toast.
      // Drop the old one instead of merging into it, otherwise its props (e.g.
      // `action`) leak into the new one.
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }

    const alreadyExists = wasDismissed
      ? undefined
      : this.toasts.find((toast) => toast.id === id);

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, dismissible, id, title: message });

          return {
            ...toast,
            ...data,
            dismissible,
            id,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, ...rest, dismissible, id });
    }

    return id;
  };

  dismiss = (id?: number | string) => {
    if (id === undefined || id === null) {
      for (const activeToast of this.getActiveToasts()) {
        this.dismissedToasts.add(activeToast.id);

        for (const subscriber of this.subscribers) {
          subscriber({ dismiss: true, id: activeToast.id });
        }
      }

      return id;
    }

    this.dismissedToasts.add(id);

    const alreadyPending = this.pendingDismissals.get(id);

    if (alreadyPending !== undefined) {
      cancelAnimationFrame(alreadyPending);
    }

    this.pendingDismissals.set(
      id,
      requestAnimationFrame(() => {
        this.pendingDismissals.delete(id);

        for (const subscriber of this.subscribers) {
          subscriber({ dismiss: true, id });
        }
      })
    );

    return id;
  };

  message = (message: ToastContent, data?: ExternalToast) =>
    // `type: undefined` resets the type when this updates a toast that had one,
    // e.g. turning a loading toast into a plain one.
    this.create({ ...data, message, type: undefined });

  error = (message: ToastContent, data?: ExternalToast) =>
    this.create({ ...data, message, type: "error" });

  success = (message: ToastContent, data?: ExternalToast) =>
    this.create({ ...data, message, type: "success" });

  info = (message: ToastContent, data?: ExternalToast) =>
    this.create({ ...data, message, type: "info" });

  warning = (message: ToastContent, data?: ExternalToast) =>
    this.create({ ...data, message, type: "warning" });

  loading = (message: ToastContent, data?: ExternalToast) =>
    this.create({ ...data, message, type: "loading" });

  // Public promise callbacks accept renderable values or functions, so dispatch by representation.
  /* eslint-disable anti-slop/no-runtime-typeof */
  promise = <ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>
  ) => {
    if (!data) {
      // oxlint-disable-next-line unicorn/no-useless-undefined -- The optional settings branch returns no promise handle.
      return undefined;
    }

    let id: string | number | undefined;

    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        description:
          typeof data.description === "function" ? undefined : data.description,
        message: data.loading,
        promise,
        type: "loading",
      });
    }

    const { finally: onFinally } = data;

    const pending = Promise.resolve(
      typeof promise === "function" ? promise() : promise
    );

    let shouldDismiss = id !== undefined;

    const originalPromise = (async () => {
      let result: ["resolve", ToastData] | ["reject", unknown];

      try {
        const response = await pending;
        result = ["resolve", response];

        if (isValidElement(response)) {
          shouldDismiss = false;
          this.create({ id, message: response, type: "default" });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;
          const error = `HTTP error! status: ${response.status}`;

          const message =
            typeof data.error === "function"
              ? await data.error(error)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(error)
              : data.description;

          this.create({
            description,
            id,
            type: "error",
            ...getPromiseSettings(message),
          });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const message =
            typeof data.error === "function"
              ? await data.error(response)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(response)
              : data.description;

          this.create({
            description,
            id,
            type: "error",
            ...getPromiseSettings(message),
          });
        } else if (data.success !== undefined) {
          shouldDismiss = false;

          const message =
            typeof data.success === "function"
              ? await data.success(response)
              : data.success;

          const description =
            typeof data.description === "function"
              ? await data.description(response)
              : data.description;

          this.create({
            description,
            id,
            type: "success",
            ...getPromiseSettings(message),
          });
        }
      } catch (error) {
        result = ["reject", error];

        if (data.error !== undefined) {
          shouldDismiss = false;

          const message =
            typeof data.error === "function"
              ? await data.error(error)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(error)
              : data.description;

          this.create({
            description,
            id,
            type: "error",
            ...getPromiseSettings(message),
          });
        }
      } finally {
        if (shouldDismiss) {
          this.dismiss(id);
          id = undefined;
        }

        void onFinally?.();
      }

      return result;
    })();

    const unwrap = async () => {
      const result = await originalPromise;

      if (result[0] === "reject") {
        throw result[1];
      }

      return result[1];
    };

    if (id === undefined) {
      return { unwrap };
    }

    return Object.assign(id, { unwrap });
  };
  /* eslint-enable anti-slop/no-runtime-typeof */

  custom = (
    jsx: (id: number | string) => JSX.Element,
    data?: ExternalToast
  ) => {
    const id = getToastId(data);
    // A custom toast has no type, so it resets the one of the toast it replaces
    this.create({ ...data, id, jsx: jsx(id), type: undefined });

    return id;
  };

  getActiveToasts = () =>
    this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
}

export const ToastState = new Observer();

function toastFunction(message: ToastContent, data?: ExternalToast) {
  return ToastState.message(message, data);
}

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();

export const toast = Object.assign(
  basicToast,
  {
    custom: ToastState.custom,
    dismiss: ToastState.dismiss,
    error: ToastState.error,
    info: ToastState.info,
    loading: ToastState.loading,
    message: ToastState.message,
    promise: ToastState.promise,
    success: ToastState.success,
    warning: ToastState.warning,
  },
  {
    getHistory,
    getToasts,
  }
);
