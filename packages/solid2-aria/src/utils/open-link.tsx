/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/openLink.tsx.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Href, LinkDOMProps } from "@solid2-aria/types-shared";
import {
  merge,
  untrack,
  createContext,
  useContext,
  createMemo,
} from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { JSX, MouseEvent as DOMMouseEvent } from "../types";
import { focusWithoutScrolling } from "./focus-without-scrolling";
import { isIPad, isMac, isWebKit } from "./platform";
import { isTruthy } from "./truthy";

interface Router {
  isNative: boolean;
  open: (
    target: Element,
    modifiers: Modifiers,
    href: Href,
    routerOptions: LinkDOMProps["routerOptions"]
  ) => void;
  useHref: (href: Href) => string;
}

const RouterContext = createContext<Router>({
  isNative: true,
  open: openSyntheticLink,
  useHref: (href) => href,
});

interface RouterProviderProps {
  navigate: (path: Href, routerOptions: LinkDOMProps["routerOptions"]) => void;
  useHref?: (href: Href) => string;
  children: SolidElement;
}

/**
 * A RouterProvider accepts a `navigate` function from a framework or client side router,
 * and provides it to all nested Solid2 Aria links to enable client side navigation.
 */
export function RouterProvider(props: RouterProviderProps): JSX.Element {
  const ctx = createMemo(() => ({
    isNative: false,
    open: (
      target: Element,
      modifiers: Modifiers,
      href: Href,
      routerOptions: LinkDOMProps["routerOptions"]
    ) => {
      getSyntheticLink(target, (link) => {
        if (shouldClientNavigate(link, modifiers)) {
          props.navigate(href, routerOptions);
        } else {
          openLink(link, modifiers);
        }
      });
    },
    useHref: (href: Href) => props.useHref?.(href) ?? href,
  }));

  const routerContext = merge(() => ctx());

  return <RouterContext value={routerContext}>{props.children}</RouterContext>;
}

export function createRouter(): Router {
  return useContext(RouterContext);
}

interface Modifiers {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export function shouldClientNavigate(
  link: HTMLAnchorElement,
  modifiers: Modifiers
): boolean {
  // Use getAttribute here instead of link.target. Firefox will default link.target to "_parent" when inside an iframe.
  const target = link.getAttribute("target");

  return (
    (!isTruthy(target) || target === "_self") &&
    link.origin === location.origin &&
    !link.hasAttribute("download") &&
    // open in new tab (mac)
    !isTruthy(modifiers.metaKey) &&
    // open in new tab (windows)
    !isTruthy(modifiers.ctrlKey) &&
    // download
    !isTruthy(modifiers.altKey) &&
    !isTruthy(modifiers.shiftKey)
  );
}

export function openLink(
  target: HTMLAnchorElement,
  modifiers: Modifiers,
  setOpening = true
): void {
  const { metaKey, ctrlKey, altKey, shiftKey } = modifiers;

  // WebKit does not support firing click events with modifier keys, but does support keyboard events.
  // https://github.com/WebKit/WebKit/blob/c03d0ac6e6db178f90923a0a63080b5ca210d25f/Source/WebCore/html/HTMLAnchorElement.cpp#L184
  const keyboardOptions = {
    altKey,
    ctrlKey,
    keyIdentifier: "Enter",
    metaKey,
    shiftKey,
  };

  const event =
    isWebKit() && isMac() && !isIPad() && process.env.NODE_ENV !== "test"
      ? new KeyboardEvent("keydown", keyboardOptions)
      : new MouseEvent("click", {
          altKey,
          bubbles: true,
          cancelable: true,
          ctrlKey,
          detail: 1,
          metaKey,
          shiftKey,
        });

  openLink.isOpening = setOpening;
  focusWithoutScrolling(target);
  target.dispatchEvent(event);
  openLink.isOpening = false;
}

// https://github.com/parcel-bundler/parcel/issues/8724
openLink.isOpening = false;

function getSyntheticLink(
  target: Element,
  open: (link: HTMLAnchorElement) => void
) {
  if (target instanceof HTMLAnchorElement) {
    open(target);
  } else if (target.attributes.getNamedItem("data-href") !== null) {
    const link = document.createElement("a");
    link.href = target.attributes.getNamedItem("data-href")?.value ?? "";

    if (target.attributes.getNamedItem("data-target") !== null) {
      link.target = target.attributes.getNamedItem("data-target")?.value ?? "";
    }

    if (target.attributes.getNamedItem("data-rel") !== null) {
      link.rel = target.attributes.getNamedItem("data-rel")?.value ?? "";
    }

    if (target.attributes.getNamedItem("data-download") !== null) {
      link.download =
        target.attributes.getNamedItem("data-download")?.value ?? "";
    }

    if (target.attributes.getNamedItem("data-ping") !== null) {
      link.ping = target.attributes.getNamedItem("data-ping")?.value ?? "";
    }

    if (target.attributes.getNamedItem("data-referrer-policy") !== null) {
      link.referrerPolicy =
        target.attributes.getNamedItem("data-referrer-policy")?.value ?? "";
    }

    target.append(link);
    open(link);
    link.remove();
  }
}

function openSyntheticLink(target: Element, modifiers: Modifiers) {
  getSyntheticLink(target, (link) => {
    openLink(link, modifiers);
  });
}

interface SyntheticLinkProps {
  "data-download": LinkDOMProps["download"];
  "data-href": string | undefined;
  "data-ping": LinkDOMProps["ping"];
  "data-referrer-policy": LinkDOMProps["referrerPolicy"];
  "data-rel": LinkDOMProps["rel"];
  "data-target": LinkDOMProps["target"];
}

export function createSyntheticLinkProps(
  props: LinkDOMProps
): SyntheticLinkProps {
  const router = createRouter();

  const href = router.useHref(untrack(() => props.href) ?? "");

  return {
    get "data-download"() {
      return props.download;
    },
    get "data-href"() {
      return isTruthy(props.href) ? href : undefined;
    },
    get "data-ping"() {
      return props.ping;
    },
    get "data-referrer-policy"() {
      return props.referrerPolicy;
    },
    get "data-rel"() {
      return props.rel;
    },
    get "data-target"() {
      return props.target;
    },
  };
}

/** @deprecated - For backward compatibility. */
export function getSyntheticLinkProps(props: LinkDOMProps): SyntheticLinkProps {
  return {
    get "data-download"() {
      return props.download;
    },
    get "data-href"() {
      return props.href;
    },
    get "data-ping"() {
      return props.ping;
    },
    get "data-referrer-policy"() {
      return props.referrerPolicy;
    },
    get "data-rel"() {
      return props.rel;
    },
    get "data-target"() {
      return props.target;
    },
  };
}

export function createLinkProps(props?: LinkDOMProps): LinkDOMProps {
  const router = createRouter();

  return {
    get download() {
      return props?.download;
    },
    get href() {
      return props?.href === undefined ? undefined : router.useHref(props.href);
    },
    get ping() {
      return props?.ping;
    },
    get referrerPolicy() {
      return props?.referrerPolicy;
    },
    get rel() {
      return props?.rel;
    },
    get target() {
      return props?.target;
    },
  };
}

export function handleLinkClick(
  e: DOMMouseEvent,
  router: Router,
  href: Href | undefined,
  routerOptions: LinkDOMProps["routerOptions"]
): void {
  // If a custom router is provided, prevent default and forward if this link should client navigate.
  if (
    !router.isNative &&
    e.currentTarget instanceof HTMLAnchorElement &&
    e.currentTarget.href &&
    // If props are applied to a router Link component, it may have already prevented default.
    !e.defaultPrevented &&
    shouldClientNavigate(e.currentTarget, e) &&
    isTruthy(href)
  ) {
    e.preventDefault();
    router.open(e.currentTarget, e, href, routerOptions);
  }
}
