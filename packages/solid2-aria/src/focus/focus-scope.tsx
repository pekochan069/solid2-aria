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
 * Derived from Adobe React Spectrum: packages/react-aria/src/focus/FocusScope.tsx.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; resolve scoped children once under their focus context for rendering and focus tracking.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusableElement } from "@solid2-aria/types-shared";
import {
  createMemo,
  untrack,
  children as resolveChildren,
  createContext,
  onSettled,
  useContext,
  createEffect,
  createSignal,
} from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { getInteractionModality } from "../interactions/create-focus-visible";
import { focusSafely } from "../interactions/focus-safely";
import type { JSX } from "../types";
import { getOwnerDocument, getOwnerWindow } from "../utils/dom-helpers";
import {
  focusableElementOrNull,
  requireElement,
  requireFocusableElement,
  requireHTMLInputElement,
} from "../utils/dom-value";
import { isFocusable, isTabbable } from "../utils/is-focusable";
import { isPresent } from "../utils/is-present";
import { isAndroid, isChrome } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import type { ShadowTreeWalker } from "../utils/shadowdom/shadow-tree-walker";
import { createShadowTreeWalker } from "../utils/shadowdom/shadow-tree-walker";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";

class Tree {
  root: TreeNode;
  private readonly fastMap = new Map<ScopeRef, TreeNode>();
  constructor() {
    this.root = new TreeNode({ scopeRef: null });
    this.fastMap.set(null, this.root);
  }
  get size(): number {
    return this.fastMap.size;
  }
  getTreeNode(data: ScopeRef): TreeNode | undefined {
    return this.fastMap.get(data);
  }
  addTreeNode(
    scopeRef: ScopeRef,
    parent: ScopeRef,
    nodeToRestore?: FocusableElement
  ): void {
    const parentNode = this.fastMap.get(parent ?? null);

    if (!parentNode) {
      return;
    }

    const node = new TreeNode({ scopeRef });
    parentNode.addChild(node);
    node.parent = parentNode;
    this.fastMap.set(scopeRef, node);

    if (nodeToRestore) {
      node.nodeToRestore = nodeToRestore;
    }
  }
  addNode(node: TreeNode): void {
    this.fastMap.set(node.scopeRef, node);
  }
  removeTreeNode(scopeRef: ScopeRef): void {
    // never remove the root
    if (scopeRef === null) {
      return;
    }

    const node = this.fastMap.get(scopeRef);

    if (!node) {
      return;
    }

    const parentNode = node.parent;

    // when we remove a scope, check if any sibling scopes are trying to restore focus to something inside the scope we're removing
    // if we are, then replace the siblings restore with the restore from the scope we're removing
    for (const current of this.traverse()) {
      if (
        current !== node &&
        node.nodeToRestore &&
        current.nodeToRestore &&
        node.scopeRef &&
        node.scopeRef() &&
        isElementInScope(current.nodeToRestore, node.scopeRef())
      ) {
        current.nodeToRestore = node.nodeToRestore;
      }
    }

    const { children } = node;

    if (parentNode) {
      // oxlint-disable-next-line unicorn/prefer-dom-node-remove -- Collection and focus-tree nodes implement their own parent/child protocol.
      parentNode.removeChild(node);

      if (children.size > 0) {
        for (const child of children) {
          whenTruthy(parentNode, (truthyValue0) => {
            truthyValue0.addChild(child);
          });
        }
      }
    }

    this.fastMap.delete(node.scopeRef);
  }
  // Pre Order Depth First
  *traverse(node: TreeNode = this.root): Generator<TreeNode> {
    if (isPresent(node.scopeRef)) {
      yield node;
    }

    if (node.children.size > 0) {
      for (const child of node.children) {
        yield* this.traverse(child);
      }
    }
  }
  clone(): Tree {
    const newTree = new Tree();

    for (const node of this.traverse()) {
      newTree.addTreeNode(
        node.scopeRef,
        node.parent?.scopeRef ?? null,
        node.nodeToRestore
      );
    }

    return newTree;
  }
}

class TreeNode {
  public scopeRef: ScopeRef;
  public nodeToRestore?: FocusableElement;
  public parent?: TreeNode;
  public children = new Set<TreeNode>();
  public contain = false;
  constructor(props: { scopeRef: ScopeRef }) {
    this.scopeRef = untrack(() => props.scopeRef);
  }
  addChild(node: TreeNode): void {
    this.children.add(node);
    node.parent = this;
  }
  removeChild(node: TreeNode): void {
    this.children.delete(node);
    node.parent = undefined;
  }
}

export const focusScopeTree: Tree = new Tree();

export interface FocusScopeProps {
  /** The contents of the focus scope. */
  children: SolidElement;
  /**
   * Whether to contain focus inside the scope, so users cannot
   * move focus outside, for example in a modal dialog.
   */
  contain?: boolean;
  /**
   * Whether to restore focus back to the element that was focused
   * when the focus scope mounted, after the focus scope unmounts.
   */
  restoreFocus?: boolean;
  /** Whether to auto focus the first focusable element in the focus scope on mount. */
  autoFocus?: boolean;
}

export interface FocusManagerOptions {
  /** The element to start searching from. The currently focused element by default. */
  from?: Element;
  /** Whether to only include tabbable elements, or all focusable elements. */
  tabbable?: boolean;
  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;
  /** A callback that determines whether the given element is focused. */
  accept?: (node: Element) => boolean;
}

export interface FocusManager {
  /** Moves focus to the next focusable or tabbable element in the focus scope. */
  focusNext: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the previous focusable or tabbable element in the focus scope. */
  focusPrevious: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the first focusable or tabbable element in the focus scope. */
  focusFirst: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the last focusable or tabbable element in the focus scope. */
  focusLast: (opts?: FocusManagerOptions) => FocusableElement | null;
}

type ScopeRef = Accessor<Element[] | null> | null;

interface IFocusContext {
  focusManager: FocusManager;
  parentNode: TreeNode | null;
}

const FocusContext = createContext<IFocusContext | null>(null);
const RESTORE_FOCUS_EVENT = "react-aria-focus-scope-restore";
let activeScope: ScopeRef = null;

/**
 * A FocusScope manages focus for its descendants. It supports containing focus inside
 * the scope, restoring focus to the previously focused element on unmount, and auto
 * focusing children on mount. It also acts as a container for a programmatic focus
 * management interface that can be used to move focus forward and back in response
 * to user events.
 */
const stopPropagation = (event: Event) => {
  event.stopPropagation();
};

export function FocusScope(props: FocusScopeProps): JSX.Element {
  const [startRef, setStartRef] = createSignal<HTMLSpanElement | null>(null, {
    ownedWrite: true,
  });

  const [endRef, setEndRef] = createSignal<HTMLSpanElement | null>(null, {
    ownedWrite: true,
  });

  const [scopeRef, setScopeRef] = createSignal<Element[]>([], {
    ownedWrite: true,
  });

  const parentNode = useContext(FocusContext)?.parentNode;
  const node = new TreeNode({ scopeRef });
  const focusManager = createFocusManagerForScope(scopeRef);
  const value = { focusManager, parentNode: node };

  const content = resolveChildren(() => (
    <FocusContext value={value}>{props.children}</FocusContext>
  ));

  onSettled(() => {
    let parent = getTruthyValue(parentNode) ?? focusScopeTree.root;

    if (
      focusScopeTree.getTreeNode(parent.scopeRef) &&
      activeScope &&
      !isAncestorScope(activeScope, parent.scopeRef)
    ) {
      parent = focusScopeTree.getTreeNode(activeScope) ?? parent;
    }

    parent.addChild(node);
    focusScopeTree.addNode(node);

    return () => {
      const parentScope =
        focusScopeTree.getTreeNode(scopeRef)?.parent?.scopeRef ?? null;

      if (
        (scopeRef === activeScope || isAncestorScope(scopeRef, activeScope)) &&
        (!parentScope || focusScopeTree.getTreeNode(parentScope))
      ) {
        activeScope = parentScope;
      }

      focusScopeTree.removeTreeNode(scopeRef);
    };
  });
  createEffect(
    () => props.contain,
    (contain) => {
      node.contain = isTruthy(contain);
    },
    { ssrSource: "client" }
  );

  createEffect(
    () => ({ content: content(), end: endRef(), start: startRef() }),
    ({ start, end }): undefined | (() => void) => {
      if (!start || !end) {
        return undefined;
      }

      let element = start.nextSibling;
      const nodes: Element[] = [];

      while (element && element !== end) {
        if (element instanceof Element) {
          nodes.push(element);
          element.addEventListener(RESTORE_FOCUS_EVENT, stopPropagation);
        }

        element = element.nextSibling;
      }

      setScopeRef(nodes);

      return () => {
        for (const elementValue of nodes) {
          elementValue.removeEventListener(
            RESTORE_FOCUS_EVENT,
            stopPropagation
          );
        }
      };
    },
    { ssrSource: "client" }
  );
  createActiveScopeTracker(
    scopeRef,
    () => props.restoreFocus,
    () => props.contain
  );
  createFocusContainment(scopeRef, () => props.contain);
  createRestoreFocus(
    scopeRef,
    () => props.restoreFocus,
    () => props.contain
  );
  createAutoFocus(scopeRef, () => props.autoFocus);
  createEffect(
    scopeRef,
    (scopeNodes) => {
      const activeElement = getActiveElement(getOwnerDocument(scopeNodes[0]));

      if (isElementInScope(activeElement, scopeNodes)) {
        let scope: TreeNode | null = null;

        for (const child of focusScopeTree.traverse()) {
          if (
            child.scopeRef &&
            isElementInScope(activeElement, untrack(child.scopeRef))
          ) {
            scope = child;
          }
        }

        if (scope && scope === focusScopeTree.getTreeNode(scopeRef)) {
          activeScope = scope.scopeRef;
        }
      }
    },
    { ssrSource: "client" }
  );

  return (
    <>
      <span
        data-focus-scope-start
        hidden
        ref={(element) => {
          setStartRef(element);
        }}
      />
      {content()}
      <span
        data-focus-scope-end
        hidden
        ref={(element) => {
          setEndRef(element);
        }}
      />
    </>
  );
}

/**
 * Returns a FocusManager interface for the parent FocusScope.
 * A FocusManager can be used to programmatically move focus within
 * a FocusScope, e.g. in response to user events like keyboard navigation.
 */
export function createFocusScopeManager(): FocusManager | undefined {
  return useContext(FocusContext)?.focusManager;
}

function createFocusManagerForScope(
  scopeRef: Accessor<Element[] | null>
): FocusManager {
  return {
    focusFirst(opts = {}) {
      const scope = requireValue(scopeRef(), "Expected focus scope nodes");
      const { tabbable, accept } = opts;
      const scopeRoot = getScopeRoot(scope);

      const walker = getFocusableTreeWalker(
        scopeRoot,
        { accept, tabbable },
        scope
      );

      walker.currentNode = requireValue(
        requireValue(scope[0], "Expected a present traversal value")
          .previousElementSibling,
        "Expected scope[0]!.previousElementSibling"
      );
      const nextNode = focusableElementOrNull(walker.nextNode());

      if (isTruthy(nextNode)) {
        focusElement(nextNode, true);
      }

      return nextNode;
    },
    focusLast(opts = {}) {
      const scope = requireValue(scopeRef(), "Expected focus scope nodes");
      const { tabbable, accept } = opts;
      const scopeRoot = getScopeRoot(scope);

      const walker = getFocusableTreeWalker(
        scopeRoot,
        { accept, tabbable },
        scope
      );

      walker.currentNode = requireValue(
        requireValue(scope.at(-1), "Expected a present traversal value")
          .nextElementSibling,
        "Expected scope.at(-1)!.nextElementSibling"
      );
      const previousNode = focusableElementOrNull(walker.previousNode());

      if (isTruthy(previousNode)) {
        focusElement(previousNode, true);
      }

      return previousNode;
    },
    focusNext(opts: FocusManagerOptions = {}) {
      const scope = requireValue(scopeRef(), "Expected focus scope nodes");
      const { from, tabbable, wrap, accept } = opts;

      const node =
        getTruthyValue(from) ??
        requireValue(
          getActiveElement(getOwnerDocument(scope[0] ?? undefined)),
          "Expected getActiveElement(getOwnerDocument(scope[0]! ?? undefined))"
        );

      const sentinel = requireValue(
        requireValue(scope[0], "Expected a present traversal value")
          .previousElementSibling,
        "Expected scope[0]!.previousElementSibling"
      );

      const scopeRoot = getScopeRoot(scope);

      const walker = getFocusableTreeWalker(
        scopeRoot,
        { accept, tabbable },
        scope
      );

      walker.currentNode = isElementInScope(node, scope) ? node : sentinel;
      let nextNode = focusableElementOrNull(walker.nextNode());

      if (!isTruthy(nextNode) && isTruthy(wrap)) {
        walker.currentNode = sentinel;
        nextNode = focusableElementOrNull(walker.nextNode());
      }

      if (isTruthy(nextNode)) {
        focusElement(nextNode, true);
      }

      return nextNode;
    },
    focusPrevious(opts: FocusManagerOptions = {}) {
      const scope = requireValue(scopeRef(), "Expected focus scope nodes");
      const { from, tabbable, wrap, accept } = opts;

      const node =
        getTruthyValue(from) ??
        requireValue(
          getActiveElement(getOwnerDocument(scope[0] ?? undefined)),
          "Expected getActiveElement(getOwnerDocument(scope[0]! ?? undefined))"
        );

      const sentinel = requireValue(
        requireValue(scope.at(-1), "Expected a present traversal value")
          .nextElementSibling,
        "Expected scope[scope.length - 1]!.nextElementSibling"
      );

      const scopeRoot = getScopeRoot(scope);

      const walker = getFocusableTreeWalker(
        scopeRoot,
        { accept, tabbable },
        scope
      );

      walker.currentNode = isElementInScope(node, scope) ? node : sentinel;
      let previousNode = focusableElementOrNull(walker.previousNode());

      if (!isTruthy(previousNode) && isTruthy(wrap)) {
        walker.currentNode = sentinel;
        previousNode = focusableElementOrNull(walker.previousNode());
      }

      if (isTruthy(previousNode)) {
        focusElement(previousNode, true);
      }

      return previousNode;
    },
  };
}

function getScopeRoot(scope: Element[]) {
  return requireValue(
    requireValue(scope[0], "Expected a present traversal value").parentElement,
    "Expected scope[0]!.parentElement"
  );
}

function shouldContainFocus(scopeRef: ScopeRef) {
  let scope = focusScopeTree.getTreeNode(activeScope);

  while (scope && scope.scopeRef !== scopeRef) {
    if (scope.contain) {
      return false;
    }

    scope = scope.parent;
  }

  return true;
}

function getRadiosInGroup(element: HTMLInputElement): HTMLInputElement[] {
  if (!element.form) {
    // Radio buttons outside a form - query the document
    return [
      ...getOwnerDocument(element).querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(element.name)}"]`
      ),
    ].filter((radio) => !radio.form);
  }

  // namedItem returns RadioNodeList (iterable) for 2+ elements, but a single Element for exactly 1.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection/namedItem
  const radioList = element.form.elements.namedItem(element.name);
  const ownerWindow = getOwnerWindow(element);

  if (radioList instanceof ownerWindow.RadioNodeList) {
    return [...radioList].filter(
      (el): el is HTMLInputElement => el instanceof ownerWindow.HTMLInputElement
    );
  }

  if (radioList instanceof ownerWindow.HTMLInputElement) {
    return [radioList];
  }

  return [];
}

function isTabbableRadio(element: HTMLInputElement): boolean {
  if (element.checked) {
    return true;
  }

  const radios = getRadiosInGroup(element);

  return radios.length > 0 && !radios.some((radio) => radio.checked);
}

function createFocusContainment(
  scopeRef: Accessor<Element[] | null>,
  contain: () => boolean | undefined
) {
  let focusedNode: FocusableElement | undefined;

  let raf: ReturnType<typeof requestAnimationFrame> | undefined;

  createEffect(
    () => ({ contain: contain(), scope: scopeRef() }),
    ({ scope, contain: shouldContain }): undefined | (() => void) => {
      if (scope === null || scope.length === 0) {
        return undefined;
      }

      if (!isTruthy(shouldContain)) {
        // if contain() was changed, then we should cancel any ongoing waits to pull focus back into containment
        if (raf !== undefined) {
          cancelAnimationFrame(raf);
          raf = undefined;
        }

        return undefined;
      }

      const ownerDocument = getOwnerDocument(
        requireValue(scope[0], "Expected first scope element")
      );

      // Handle the Tab key to contain() focus within the scope
      const onKeyDown = (e: KeyboardEvent) => {
        if (!isRestoreFocusTab(e, scopeRef)) {
          return;
        }

        const focusedElement = getActiveElement(ownerDocument);
        const scopeValue = scopeRef();

        if (!scopeValue || !isElementInScope(focusedElement, scopeValue)) {
          return;
        }

        const scopeRoot = getScopeRoot(scopeValue);

        const walker = getFocusableTreeWalker(
          scopeRoot,
          { tabbable: true },
          scopeValue
        );

        if (!focusedElement) {
          return;
        }

        walker.currentNode = focusedElement;

        let nextElement = focusableElementOrNull(
          e.shiftKey ? walker.previousNode() : walker.nextNode()
        );

        if (!isTruthy(nextElement)) {
          walker.currentNode = e.shiftKey
            ? requireValue(
                requireValue(
                  scopeValue.at(-1),
                  "Expected a present traversal value"
                ).nextElementSibling,
                "Expected scope.at(-1)!.nextElementSibling"
              )
            : requireValue(
                requireValue(
                  scopeValue[0],
                  "Expected a present traversal value"
                ).previousElementSibling,
                "Expected scope[0]!.previousElementSibling"
              );
          nextElement = focusableElementOrNull(
            e.shiftKey ? walker.previousNode() : walker.nextNode()
          );
        }

        e.preventDefault();

        if (isTruthy(nextElement)) {
          focusElement(nextElement, true);

          if (
            nextElement instanceof getOwnerWindow(nextElement).HTMLInputElement
          ) {
            nextElement.select();
          }
        }
      };

      const onFocus: EventListener = (e) => {
        // If focusing an element in a child scope of the currently active scope, the child becomes active.
        // Moving out of the active scope to an ancestor is not allowed.
        if (
          (!activeScope || isAncestorScope(activeScope, scopeRef)) &&
          isElementInScope(requireElement(getEventTarget(e)), scope)
        ) {
          activeScope = scopeRef;
          focusedNode = requireFocusableElement(getEventTarget(e));
        } else if (
          shouldContainFocus(scopeRef) &&
          !isElementInChildScope(requireElement(getEventTarget(e)), scopeRef)
        ) {
          // If a focus event occurs outside the active scope (e.g. user tabs from browser location bar),
          // restore focus to the previously focused node or the first tabbable element in the active scope.
          if (focusedNode) {
            focusElement(focusedNode);
          } else {
            const activeNodes = activeScope?.();

            if (activeNodes) {
              focusFirstInScope(activeNodes);
            }
          }
        } else if (shouldContainFocus(scopeRef)) {
          focusedNode = requireFocusableElement(getEventTarget(e));
        }
      };

      const onBlur: EventListener = (e) => {
        // Firefox doesn't shift focus back to the Dialog properly without this
        if (raf !== undefined) {
          cancelAnimationFrame(raf);
        }

        raf = requestAnimationFrame(() => {
          // Patches infinite focus coersion loop for Android Talkback where the user isn't able to move the virtual cursor
          // if within a containing focus scope. Bug filed against Chrome: https://issuetracker.google.com/issues/384844019.
          // Note that this means focus can leave focus containing modals due to this, but it is isolated to Chrome Talkback.
          const modality = getInteractionModality();

          const shouldSkipFocusRestore =
            (modality === "virtual" || modality === null) &&
            isAndroid() &&
            isChrome();

          // Use document.activeElement instead of e.relatedTarget so we can tell if user clicked into iframe
          const activeElement = getActiveElement(ownerDocument);

          if (
            !shouldSkipFocusRestore &&
            activeElement &&
            shouldContainFocus(scopeRef) &&
            !isElementInChildScope(activeElement, scopeRef)
          ) {
            activeScope = scopeRef;
            const target = requireFocusableElement(getEventTarget(e));

            if (isTruthy(target) && target.isConnected) {
              focusedNode = target;
              focusElement(focusedNode);
            } else {
              const activeNodes = activeScope();

              if (activeNodes) {
                focusFirstInScope(activeNodes);
              }
            }
          }
        });
      };

      ownerDocument.addEventListener("keydown", onKeyDown, false);
      ownerDocument.addEventListener("focusin", onFocus, false);

      for (const element of scope ?? []) {
        element.addEventListener("focusin", onFocus, false);
      }

      for (const element of scope ?? []) {
        element.addEventListener("focusout", onBlur, false);
      }

      return () => {
        ownerDocument.removeEventListener("keydown", onKeyDown, false);
        ownerDocument.removeEventListener("focusin", onFocus, false);

        for (const element of scope ?? []) {
          element.removeEventListener("focusin", onFocus, false);
        }

        for (const element of scope ?? []) {
          element.removeEventListener("focusout", onBlur, false);
        }
      };
    },
    { ssrSource: "client" }
  );
  onSettled(() => () => {
    if (raf !== undefined) {
      cancelAnimationFrame(raf);
    }
  });
}

function isElementInAnyScope(element: Element) {
  return isElementInChildScope(element);
}

function isElementInScope(element?: Element | null, scope?: Element[] | null) {
  if (!element) {
    return false;
  }

  if (!scope) {
    return false;
  }

  return scope.some((node) => nodeContains(node, element));
}

function isElementInChildScope(element: Element, scope: ScopeRef = null) {
  // If the element is within a top layer element (e.g. toasts), always allow moving focus there.
  if (
    element instanceof Element &&
    element.closest("[data-react-aria-top-layer]")
  ) {
    return true;
  }

  // node.contains in isElementInScope covers child scopes that are also DOM children,
  // but does not cover child scopes in portals.
  for (const { scopeRef: s } of focusScopeTree.traverse(
    focusScopeTree.getTreeNode(scope)
  )) {
    if (s && isElementInScope(element, untrack(s))) {
      return true;
    }
  }

  return false;
}

/** @private */
export function isElementInChildOfActiveScope(element: Element): boolean {
  return isElementInChildScope(element, activeScope);
}

function isAncestorScope(ancestor: ScopeRef, scope: ScopeRef) {
  let parent = focusScopeTree.getTreeNode(scope)?.parent;

  while (parent) {
    if (parent.scopeRef === ancestor) {
      return true;
    }

    ({ parent } = parent);
  }

  return false;
}

function focusElement(element: FocusableElement | null, scroll = false) {
  if (isPresent(element) && !scroll) {
    try {
      focusSafely(element);
    } catch {
      // ignore
    }
  } else if (isPresent(element)) {
    try {
      element.focus();
    } catch {
      // ignore
    }
  }
}

function getFirstInScope(
  scope: Element[],
  tabbable = true
): FocusableElement | null {
  const sentinel = requireValue(
    requireValue(scope[0], "Expected a present traversal value")
      .previousElementSibling,
    "Expected scope[0]!.previousElementSibling"
  );

  let scopeRoot = getScopeRoot(scope);
  let walker = getFocusableTreeWalker(scopeRoot, { tabbable }, scope);
  walker.currentNode = sentinel;
  let nextNode = walker.nextNode();

  // If the scope does not contain a tabbable element, use the first focusable element.
  if (tabbable && !nextNode) {
    scopeRoot = getScopeRoot(scope);
    walker = getFocusableTreeWalker(scopeRoot, { tabbable: false }, scope);
    walker.currentNode = sentinel;
    nextNode = walker.nextNode();
  }

  // TreeWalker.nextNode() returns null when the scope contains no focusable element.
  return focusableElementOrNull(nextNode);
}

function focusFirstInScope(scope: Element[], tabbable = true) {
  focusElement(getFirstInScope(scope, tabbable));
}

function createAutoFocus(
  scopeRef: Accessor<Element[] | null>,
  autoFocus: () => boolean | undefined
) {
  let pendingAutoFocus = untrack(autoFocus);
  createEffect(
    scopeRef,
    (scope) => {
      if (!isTruthy(pendingAutoFocus) || scope === null || scope.length === 0) {
        return;
      }

      pendingAutoFocus = false;
      activeScope = scopeRef;
      const ownerDocument = getOwnerDocument(scope[0]);

      if (!isElementInScope(getActiveElement(ownerDocument), scope)) {
        focusFirstInScope(scope);
      }
    },
    { ssrSource: "client" }
  );
}

function createActiveScopeTracker(
  scopeRef: Accessor<Element[] | null>,
  restore: () => boolean | undefined,
  contain: () => boolean | undefined
) {
  // Track active scopes that do not contain or restore focus.
  createEffect(
    () => ({ contain: contain(), restore: restore(), scope: scopeRef() }),
    ({
      scope,
      restore: shouldRestore,
      contain: shouldContain,
    }): undefined | (() => void) => {
      if (
        scope === null ||
        scope.length === 0 ||
        isTruthy(shouldRestore) ||
        isTruthy(shouldContain)
      ) {
        return undefined;
      }

      const ownerDocument = getOwnerDocument(
        requireValue(scope[0], "Expected first scope element")
      );

      const onFocus = (e: Event) => {
        const target = requireElement(getEventTarget(e));

        if (isElementInScope(target, scope)) {
          activeScope = scopeRef;
        } else if (!isElementInAnyScope(target)) {
          activeScope = null;
        }
      };

      ownerDocument.addEventListener("focusin", onFocus, false);

      for (const element of scope ?? []) {
        element.addEventListener("focusin", onFocus, false);
      }

      return () => {
        ownerDocument.removeEventListener("focusin", onFocus, false);

        for (const element of scope ?? []) {
          element.removeEventListener("focusin", onFocus, false);
        }
      };
    },
    { ssrSource: "client" }
  );
}

function shouldRestoreFocus(scopeRef: ScopeRef) {
  let scope = focusScopeTree.getTreeNode(activeScope);

  while (scope && scope.scopeRef !== scopeRef) {
    if (scope.nodeToRestore) {
      return false;
    }

    scope = scope.parent;
  }

  return scope?.scopeRef === scopeRef;
}

function createRestoreFocus(
  scopeRef: Accessor<Element[] | null>,
  restoreFocus: () => boolean | undefined,
  contain: () => boolean | undefined
) {
  // Capture focus before scoped children can autofocus.
  const initialFocusTarget = untrack(() =>
    typeof document === "undefined"
      ? null
      : focusableElementOrNull(
          getActiveElement(getOwnerDocument(scopeRef()?.[0]))
        )
  );

  const scopeReady = createMemo(() => (scopeRef()?.length ?? 0) > 0);

  // restoring scopes should all track if they are active regardless of contain(), but contain() already tracks it plus logic to contain() the focus
  // restoring-non-containing scopes should only care if they become active so they can perform the restore
  createEffect(
    () => ({ contain: contain(), restore: restoreFocus(), scope: scopeRef() }),
    ({
      scope,
      restore: shouldRestore,
      contain: shouldContain,
    }): undefined | (() => void) => {
      if (scope === null || scope.length === 0) {
        return undefined;
      }

      const ownerDocument = getOwnerDocument(
        requireValue(scope[0], "Expected first scope element")
      );

      if (!isTruthy(shouldRestore) || isTruthy(shouldContain)) {
        return undefined;
      }

      const onFocus = () => {
        // If focusing an element in a child scope of the currently active scope, the child becomes active.
        // Moving out of the active scope to an ancestor is not allowed.
        if (
          (!activeScope || isAncestorScope(activeScope, scopeRef)) &&
          isElementInScope(getActiveElement(ownerDocument), scope)
        ) {
          activeScope = scopeRef;
        }
      };

      ownerDocument.addEventListener("focusin", onFocus, false);

      for (const element of scope ?? []) {
        element.addEventListener("focusin", onFocus, false);
      }

      return () => {
        ownerDocument.removeEventListener("focusin", onFocus, false);

        for (const element of scope ?? []) {
          element.removeEventListener("focusin", onFocus, false);
        }
      };
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ contain: contain(), restore: restoreFocus(), scope: scopeRef() }),
    ({
      scope,
      restore: shouldRestore,
      contain: shouldContain,
    }): undefined | (() => void) => {
      if (scope === null || scope.length === 0) {
        return undefined;
      }

      const ownerDocument = getOwnerDocument(scope[0]);

      if (!isTruthy(shouldRestore)) {
        return undefined;
      }

      // Handle the Tab key so that tabbing out of the scope goes to the next element
      // after the node that had focus when the scope mounted. This is important when
      // using portals for overlays, so that focus goes to the expected element when
      // tabbing out of the overlay.
      const onKeyDown = (e: KeyboardEvent) => {
        if (!isRestoreFocusTab(e, scopeRef)) {
          return;
        }

        const focusedElement = focusableElementOrNull(
          ownerDocument.activeElement
        );

        if (
          focusedElement === null ||
          !isElementInChildScope(focusedElement, scopeRef) ||
          !shouldRestoreFocus(scopeRef)
        ) {
          return;
        }

        const treeNode = focusScopeTree.getTreeNode(scopeRef);

        if (!treeNode) {
          return;
        }

        let { nodeToRestore } = treeNode;

        // Create a DOM tree walker that matches all tabbable elements
        const walker = getFocusableTreeWalker(ownerDocument.body, {
          tabbable: true,
        });

        // Find the next tabbable element after the currently focused element
        walker.currentNode = focusedElement;

        let nextElement = focusableElementOrNull(
          e.shiftKey ? walker.previousNode() : walker.nextNode()
        );

        if (
          !nodeToRestore ||
          !nodeToRestore.isConnected ||
          nodeToRestore === ownerDocument.body
        ) {
          nodeToRestore = undefined;
          treeNode.nodeToRestore = undefined;
        }

        // If there is no next element, or it is outside the current scope, move focus to the
        // next element after the node to restore to instead.
        if (
          (!isTruthy(nextElement) ||
            !isElementInChildScope(nextElement, scopeRef)) &&
          nodeToRestore
        ) {
          walker.currentNode = nodeToRestore;

          // Skip over elements within the scope, in case the scope immediately follows the node to restore.
          do {
            nextElement = focusableElementOrNull(
              e.shiftKey ? walker.previousNode() : walker.nextNode()
            );
          } while (
            nextElement !== null &&
            isElementInChildScope(nextElement, scopeRef)
          );

          e.preventDefault();
          e.stopPropagation();

          if (isTruthy(nextElement)) {
            focusElement(nextElement, true);
          } else if (isElementInAnyScope(nodeToRestore)) {
            focusElement(nodeToRestore, true);
          } else {
            focusedElement.blur();
          }
        }
      };

      if (!isTruthy(shouldContain)) {
        ownerDocument.addEventListener("keydown", onKeyDown, true);
      }

      return () => {
        if (!isTruthy(shouldContain)) {
          ownerDocument.removeEventListener("keydown", onKeyDown, true);
        }
      };
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ ready: scopeReady(), restore: restoreFocus() }),
    ({ ready, restore: shouldRestore }): undefined | (() => void) => {
      if (!ready || !isTruthy(shouldRestore)) {
        return undefined;
      }

      const ownerDocument = getOwnerDocument(untrack(scopeRef)?.[0]);

      if (!isTruthy(shouldRestore)) {
        return undefined;
      }

      const treeNode = focusScopeTree.getTreeNode(scopeRef);

      if (!treeNode) {
        return undefined;
      }

      treeNode.nodeToRestore = initialFocusTarget ?? undefined;

      return () => {
        const treeNodeValue = focusScopeTree.getTreeNode(scopeRef);

        if (!treeNodeValue) {
          return;
        }

        const { nodeToRestore } = treeNodeValue;
        // if we already lost focus to the body and this was the active scope, then we should attempt to restore
        const activeElement = getActiveElement(ownerDocument);

        if (
          isTruthy(untrack(restoreFocus)) &&
          nodeToRestore &&
          ((activeElement && isElementInChildScope(activeElement, scopeRef)) ||
            (activeElement === ownerDocument.body &&
              shouldRestoreFocus(scopeRef)))
        ) {
          // freeze the focusScopeTree so it persists after the raf, otherwise during unmount nodes are removed from it
          const clonedTree = focusScopeTree.clone();
          requestAnimationFrame(() => {
            // Only restore focus if we've lost focus to the body, the alternative is that focus has been purposefully moved elsewhere
            if (ownerDocument.activeElement === ownerDocument.body) {
              // look up the tree starting with our scope to find a nodeToRestore still in the DOM
              let treeNodeValue2 = clonedTree.getTreeNode(scopeRef);

              while (treeNodeValue2) {
                if (
                  treeNodeValue2.nodeToRestore &&
                  treeNodeValue2.nodeToRestore.isConnected
                ) {
                  restoreFocusToElement(treeNodeValue2.nodeToRestore);

                  return;
                }

                treeNodeValue2 = treeNodeValue2.parent;
              }

              // If no nodeToRestore was found, focus the first element in the nearest
              // ancestor scope that is still in the tree.
              treeNodeValue2 = clonedTree.getTreeNode(scopeRef);

              while (treeNodeValue2) {
                const scopeNodes = treeNodeValue2.scopeRef?.();

                if (
                  scopeNodes &&
                  focusScopeTree.getTreeNode(treeNodeValue2.scopeRef)
                ) {
                  const node = getFirstInScope(scopeNodes, true);

                  // The scope may have nothing focusable in it, e.g. if its focusable
                  // content was removed or hidden. Keep walking up in that case.
                  if (node) {
                    restoreFocusToElement(node);

                    return;
                  }
                }

                treeNodeValue2 = treeNodeValue2.parent;
              }
            }
          });
        }
      };
    },
    { ssrSource: "client" }
  );
}

function restoreFocusToElement(node: FocusableElement) {
  // Dispatch a custom event that parent elements can intercept to customize focus restoration.
  // For example, virtualized collection components reuse DOM elements, so the original element
  // might still exist in the DOM but representing a different item.
  if (
    node.dispatchEvent(
      new CustomEvent(RESTORE_FOCUS_EVENT, { bubbles: true, cancelable: true })
    )
  ) {
    focusElement(node);
  }
}

/**
 * Create a [TreeWalker]{@link https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker}
 * that matches all focusable/tabbable elements.
 */
export function getFocusableTreeWalker(
  root: Element,
  opts?: FocusManagerOptions,
  scope?: Element[]
): ShadowTreeWalker | TreeWalker {
  const filter = isTruthy(opts?.tabbable) ? isTabbable : isFocusable;
  // Ensure that root is an Element or fall back appropriately
  const rootElement = root?.nodeType === Node.ELEMENT_NODE ? root : null;
  // Determine the document to use
  const doc = getOwnerDocument(rootElement);

  // Create a TreeWalker, ensuring the root is an Element or Document
  const walker = createShadowTreeWalker(
    doc,
    getTruthyValue(root) ?? doc,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // Skip nodes inside the starting node.
        if (nodeContains(opts?.from, node)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          isTruthy(opts?.tabbable) &&
          requireElement(node).tagName === "INPUT" &&
          requireHTMLInputElement(node).getAttribute("type") === "radio"
        ) {
          // If the radio is in a form, we can get all the other radios by name
          if (!isTabbableRadio(requireHTMLInputElement(node))) {
            return NodeFilter.FILTER_REJECT;
          }

          // If the radio is in the same group as the current node and none are selected, we can skip it
          if (
            requireElement(walker.currentNode).tagName === "INPUT" &&
            requireHTMLInputElement(walker.currentNode).type === "radio" &&
            requireHTMLInputElement(walker.currentNode).name ===
              requireHTMLInputElement(node).name
          ) {
            return NodeFilter.FILTER_REJECT;
          }
        }

        if (
          filter(requireElement(node)) &&
          (!scope || isElementInScope(requireElement(node), scope)) &&
          (!opts?.accept || opts.accept(requireElement(node)))
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  if (opts?.from) {
    walker.currentNode = opts.from;
  }

  return walker;
}

/**
 * Creates a FocusManager object that can be used to move focus within an element.
 */
export function createFocusManager(
  ref: Accessor<Element | null>,
  defaultOptions: FocusManagerOptions = {}
): FocusManager {
  return {
    focusFirst(opts = defaultOptions) {
      const root = ref();

      if (!root) {
        return null;
      }

      const {
        tabbable = defaultOptions.tabbable,
        accept = defaultOptions.accept,
      } = opts;

      const walker = getFocusableTreeWalker(root, { accept, tabbable });
      const nextNode = focusableElementOrNull(walker.nextNode());

      if (isTruthy(nextNode)) {
        focusElement(nextNode, true);
      }

      return nextNode;
    },
    focusLast(opts = defaultOptions) {
      const root = ref();

      if (!root) {
        return null;
      }

      const {
        tabbable = defaultOptions.tabbable,
        accept = defaultOptions.accept,
      } = opts;

      const walker = getFocusableTreeWalker(root, { accept, tabbable });
      const next = last(walker);

      if (next) {
        focusElement(next, true);
      }

      return next ?? null;
    },
    focusNext(opts: FocusManagerOptions = {}) {
      const root = ref();

      if (!root) {
        return null;
      }

      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;

      const node =
        getTruthyValue(from) ?? getActiveElement(getOwnerDocument(root));

      const walker = getFocusableTreeWalker(root, { accept, tabbable });

      if (nodeContains(root, node)) {
        walker.currentNode = requireValue(node, "Expected node");
      }

      let nextNode = focusableElementOrNull(walker.nextNode());

      if (!isTruthy(nextNode) && isTruthy(wrap)) {
        walker.currentNode = root;
        nextNode = focusableElementOrNull(walker.nextNode());
      }

      if (isTruthy(nextNode)) {
        focusElement(nextNode, true);
      }

      return nextNode;
    },
    focusPrevious(opts: FocusManagerOptions = defaultOptions) {
      const root = ref();

      if (!root) {
        return null;
      }

      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;

      const node =
        getTruthyValue(from) ?? getActiveElement(getOwnerDocument(root));

      const walker = getFocusableTreeWalker(root, { accept, tabbable });

      if (nodeContains(root, node)) {
        walker.currentNode = requireValue(node, "Expected node");
      } else {
        const next = last(walker);

        if (next) {
          focusElement(next, true);
        }

        return next ?? null;
      }

      let previousNode = focusableElementOrNull(walker.previousNode());

      if (!isTruthy(previousNode) && isTruthy(wrap)) {
        walker.currentNode = root;
        const lastNode = last(walker);

        if (!lastNode) {
          // couldn't wrap
          return null;
        }

        previousNode = lastNode;
      }

      if (isTruthy(previousNode)) {
        focusElement(previousNode, true);
      }

      return previousNode ?? null;
    },
  };
}

function last(walker: ShadowTreeWalker | TreeWalker) {
  let next;
  let lastValue: FocusableElement | null;

  do {
    lastValue = focusableElementOrNull(walker.lastChild());

    if (isTruthy(lastValue)) {
      next = lastValue;
    }
  } while (isTruthy(lastValue));

  return next;
}

function isRestoreFocusTab(
  e: KeyboardEvent,
  scopeRef: Accessor<Element[] | null>
): boolean {
  return (
    e.key === "Tab" &&
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    shouldContainFocus(scopeRef) &&
    !e.isComposing
  );
}
