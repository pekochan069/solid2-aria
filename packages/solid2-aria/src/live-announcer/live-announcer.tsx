/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/live-announcer/LiveAnnouncer.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isTruthy } from "../utils/truthy";

type Assertiveness = "assertive" | "polite";

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
const LIVEREGION_TIMEOUT_DELAY = 7000;

let liveAnnouncer: LiveAnnouncer | null = null;

type Message = string | { "aria-labelledby": string };

/**
 * Announces the message using screen reader technology.
 */
export function announce(
  message: Message,
  assertiveness: Assertiveness = "assertive",
  timeout: number = LIVEREGION_TIMEOUT_DELAY
): void {
  if (liveAnnouncer) {
    liveAnnouncer.announce(message, assertiveness, timeout);
  } else {
    liveAnnouncer = new LiveAnnouncer();
    // wait for the live announcer regions to be added to the dom, then announce
    // otherwise Safari won't announce the message if it's added too quickly
    // found most times less than 100ms were not consistent when announcing with Safari

    const isTestEnvironment = process.env.NODE_ENV === "test";

    if (isTestEnvironment) {
      liveAnnouncer.announce(message, assertiveness, timeout);
    } else {
      setTimeout(() => {
        if (isTruthy(liveAnnouncer?.isAttached())) {
          liveAnnouncer?.announce(message, assertiveness, timeout);
        }
      }, 100);
    }
  }
}

/**
 * Stops all queued announcements.
 */
export function clearAnnouncer(assertiveness: Assertiveness): void {
  if (liveAnnouncer) {
    liveAnnouncer.clear(assertiveness);
  }
}

/**
 * Removes the announcer from the DOM.
 */
export function destroyAnnouncer(): void {
  if (liveAnnouncer) {
    liveAnnouncer.destroy();
    liveAnnouncer = null;
  }
}

class LiveAnnouncer {
  node: HTMLElement | null = null;
  assertiveLog: HTMLElement | null = null;
  politeLog: HTMLElement | null = null;

  constructor() {
    if (typeof document !== "undefined") {
      this.node = document.createElement("div");
      this.node.dataset.liveAnnouncer = "true";
      // copied from VisuallyHidden
      Object.assign(this.node.style, {
        border: 0,
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
      });

      this.assertiveLog = LiveAnnouncer.createLog("assertive");
      this.node.append(this.assertiveLog);

      this.politeLog = LiveAnnouncer.createLog("polite");
      this.node.append(this.politeLog);

      document.body.prepend(this.node);
    }
  }

  isAttached() {
    return this.node?.isConnected;
  }

  private static createLog(ariaLive: string) {
    const node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", ariaLive);
    node.setAttribute("aria-relevant", "additions");

    return node;
  }

  destroy() {
    if (!this.node) {
      return;
    }

    this.node.remove();
    this.node = null;
  }

  announce(
    message: Message,
    assertiveness = "assertive",
    timeout = LIVEREGION_TIMEOUT_DELAY
  ) {
    if (!this.node) {
      return;
    }

    const node = document.createElement("div");

    if (typeof message === "object") {
      // To read an aria-labelledby, the element must have an appropriate role, such as img.
      node.setAttribute("role", "img");
      node.setAttribute("aria-labelledby", message["aria-labelledby"]);
    } else {
      node.textContent = message;
    }

    if (assertiveness === "assertive") {
      this.assertiveLog?.append(node);
    } else {
      this.politeLog?.append(node);
    }

    if (message !== "") {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness: Assertiveness) {
    if (!this.node) {
      return;
    }

    if (
      (!assertiveness || assertiveness === "assertive") &&
      this.assertiveLog
    ) {
      this.assertiveLog.innerHTML = "";
    }

    if ((!assertiveness || assertiveness === "polite") && this.politeLog) {
      this.politeLog.innerHTML = "";
    }
  }
}
