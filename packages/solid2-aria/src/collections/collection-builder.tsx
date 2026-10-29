/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/collections/CollectionBuilder.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2; isolate nested item identity, subscribe to document revisions only on the client, and finalize initial descriptors synchronously for hydration.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, Node } from "@solid2-aria/types-shared";
import { isServer } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createSignal,
  omit,
  onCleanup,
  untrack,
  useContext,
} from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { FocusableContext } from "../interactions/create-focusable";
import type { Ref } from "../types";
import { isCallable } from "../utils/is-callable";
import { readProperty } from "../utils/read-property";
import { BaseCollection, CollectionNode } from "./base-collection";
import {
  createCachedChildren,
  CollectionItemContext,
} from "./create-cached-children";
import type { CachedChildrenOptions } from "./create-cached-children";
import { Document } from "./document";
import type { BaseNode } from "./document";
import { Hidden } from "./hidden";

const ShallowRenderContext = createContext(false);

const CollectionDocumentContext = createContext<Document<
  unknown,
  BaseCollection<unknown>
> | null>(null);

const CollectionNodeContext = createContext<BaseNode<unknown> | null>(null);

// oxlint-disable-next-line typescript/no-explicit-any -- The collection factory preserves C; its item type is erased only by the document context.
export interface CollectionBuilderProps<C extends BaseCollection<any>> {
  content: SolidElement;
  children: (collection: C) => SolidElement;
  createCollection?: () => C;
}

// oxlint-disable-next-line typescript/no-explicit-any -- Preserve the factory collection subtype without constraining its item renderer variance.
export function CollectionBuilder<C extends BaseCollection<any>>(
  props: CollectionBuilderProps<C> & { createCollection: () => C }
): SolidElement;
export function CollectionBuilder(
  props: CollectionBuilderProps<BaseCollection<unknown>>
): SolidElement;
// oxlint-disable-next-line typescript/no-explicit-any -- Preserve the factory collection subtype without constraining its item renderer variance.
export function CollectionBuilder<C extends BaseCollection<any>>(
  props: CollectionBuilderProps<C>
): SolidElement {
  const parent = useContext(CollectionDocumentContext);

  if (parent) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return untrack(() => props.content);
  }

  const document = new Document(
    untrack(() => {
      if (props.createCollection) {
        return props.createCollection();
      }

      // SAFETY: The overload without a factory accepts only the base collection type.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Generic collection subtypes require their own factory in the public overload.
      return new BaseCollection() as C;
    })
  );

  const [revision, setRevision] = createSignal(0, { ownedWrite: true });

  if (!isServer) {
    onCleanup(
      document.subscribe(() => {
        setRevision((value) => value + 1);
      })
    );
  }

  const collection = isServer
    ? () => document.getCollection()
    : // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
      () => {
        revision();

        return document.getCollection();
      };

  // Keep the rendered component owner stable while collection snapshots change.
  // Collection methods and properties observe the latest immutable document snapshot.
  const liveCollection = new Proxy(untrack(collection), {
    get(_target, key) {
      const snapshot = untrack(() => key in collection())
        ? collection()
        : undefined;

      const value =
        snapshot === undefined ? undefined : readProperty(snapshot, key);

      return isCallable(value) ? value.bind(snapshot) : value;
    },
    getOwnPropertyDescriptor(_target, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(collection(), key);

      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
    has(_target, key) {
      return key in collection();
    },
    ownKeys() {
      return Reflect.ownKeys(collection());
    },
  });

  return (
    <>
      <Hidden>
        <CollectionItemContext value={null}>
          <CollectionDocumentContext value={document}>
            {props.content}
          </CollectionDocumentContext>
        </CollectionItemContext>
      </Hidden>
      {untrack(() => props.children(liveCollection))}
    </>
  );
}

export interface CollectionNodeClass<T> {
  new (key: Key): CollectionNode<T>;
  readonly type: string;
}

function nodeClass(type: string): CollectionNodeClass<unknown> {
  return class extends CollectionNode<unknown> {
    static override readonly type = type;
  };
}

function createCollectionNode<E extends Element>(
  type: CollectionNodeClass<unknown> | string,
  // oxlint-disable-next-line anti-slop/no-object-parameters -- The framework adapter forwards arbitrary component props to the typed collection factory.
  props: object,
  ref: Ref<E> | undefined,
  rendered?: SolidElement,
  children?: () => SolidElement,
  render?: (node: Node<unknown>) => SolidElement
): SolidElement {
  const parent =
    useContext(CollectionNodeContext) ?? useContext(CollectionDocumentContext);

  if (!parent) {
    return null;
  }

  const item = useContext(CollectionItemContext);
  const Constructor = typeof type === "string" ? nodeClass(type) : type;
  const element = parent.ownerDocument.createElement(Constructor.type);

  const deferredContent = (
    // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Generic render callbacks receive their owner's state at this framework boundary.
    valueArgument?: unknown,
    ...args: unknown[]
  ): SolidElement => {
    // SAFETY: Collection factories accept only Solid children or render callbacks returning Solid children.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The generic component props are erased by the document context.
    const value = readProperty(props, "children") as
      | SolidElement
      | ((...values: unknown[]) => SolidElement);

    return typeof value === "function" ? value(valueArgument, ...args) : value;
  };

  const currentProps = () => {
    const result = {
      ...item,
      ...// oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
      omit(props, (key) => key === "children"),
      // oxlint-enable solid/reactivity
    };

    if (children) {
      return result;
    }

    const descriptor = Object.getOwnPropertyDescriptor(props, "children");

    return {
      ...result,
      children:
        typeof descriptor?.value === "string"
          ? descriptor.value
          : deferredContent,
    };
  };

  const setProps = (value: ReturnType<typeof currentProps>) => {
    // SAFETY: The renderer resolves zero-argument child functions lazily, preserving the visible collection item's owner.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- Core Element omits renderer thunks, which must stay unevaluated while the hidden collection builds.
    const lazyContent = deferredContent as unknown as SolidElement;

    element.setProps(
      value,
      ref,
      Constructor,
      children ? rendered : lazyContent,
      render
    );
  };

  untrack(() => {
    setProps(currentProps());
    // oxlint-disable-next-line unicorn/prefer-dom-node-append -- Collection nodes implement the custom appendChild API.
    parent.appendChild(element);
  });
  createEffect(currentProps, setProps);
  onCleanup(() => {
    // oxlint-disable-next-line unicorn/prefer-dom-node-remove -- Collection and focus-tree nodes implement their own parent/child protocol.
    parent.removeChild(element);
  });

  return (
    <CollectionNodeContext value={element}>
      {children?.()}
    </CollectionNodeContext>
  );
}

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- P preserves renderer props through the collection factory type erasure.
function renderCollectionNode<T, P, E extends Element>(
  node: Node<unknown>,
  render: (props: P, ref: Ref<E>, node: Node<T>) => SolidElement
): SolidElement {
  // SAFETY: The component factory stores and renders the same typed props, ref, and item node.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The collection context erases the factory's generic parameters.
  const typedNode = node as Omit<Node<T>, "props"> & {
    props: P & { ref: Ref<E> };
  };

  return untrack(() => render(typedNode.props, typedNode.props.ref, typedNode));
}

export function createLeafComponent<T, P extends object, E extends Element>(
  type: CollectionNodeClass<unknown> | string,
  render: (props: P, ref: Ref<E>, node: Node<T>) => SolidElement
): (props: P & { ref?: Ref<E> }) => SolidElement;
export function createLeafComponent<P extends object, E extends Element>(
  type: CollectionNodeClass<unknown> | string,
  render: (props: P, ref: Ref<E>) => SolidElement
): (props: P & { ref?: Ref<E> }) => SolidElement;
export function createLeafComponent<T, P extends object, E extends Element>(
  type: CollectionNodeClass<unknown> | string,
  render: (props: P, ref: Ref<E>, node: Node<T>) => SolidElement
): (props: P & { ref?: Ref<E> }) => SolidElement {
  return (props) => {
    const focusable = useContext(FocusableContext);

    const shallow =
      useContext(ShallowRenderContext) ||
      !!useContext(CollectionDocumentContext);

    if (!shallow) {
      if (render.length >= 3) {
        throw new Error(
          `${render.name} cannot be rendered outside a collection.`
        );
      }

      // SAFETY: The two-argument renderer is selected only after checking its arity.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The overload distinguishes renderers by their required node argument.
      const renderOutsideCollection = render as (
        props: P,
        ref: Ref<E>
      ) => SolidElement;

      return untrack(() => renderOutsideCollection(props, props.ref));
    }

    return createCollectionNode(
      type,
      props,
      untrack(() => props.ref),
      null,
      undefined,
      (node) => (
        <FocusableContext value={focusable}>
          {renderCollectionNode(node, render)}
        </FocusableContext>
      )
    );
  };
}

export function createBranchComponent<
  T,
  P extends { children?: SolidElement | ((item: T) => SolidElement) },
  E extends Element,
>(
  type: CollectionNodeClass<unknown> | string,
  render: (props: P, ref: Ref<E>, node: Node<T>) => SolidElement,
  createChildren: (props: P) => SolidElement = (props) => {
    const children = createCachedChildren(props);

    return <>{children()}</>;
  }
): (props: P & { ref?: Ref<E> }) => SolidElement {
  return (props) =>
    createCollectionNode(
      type,
      props,
      untrack(() => props.ref),
      null,
      () => createChildren(props),
      (node) => renderCollectionNode(node, render)
    );
}

export type CollectionProps<T> = CachedChildrenOptions<T>;

const CollectionContext = createContext<Pick<
  CachedChildrenOptions<unknown>,
  "dependencies" | "idScope"
> | null>(null);

export function Collection<T>(props: CollectionProps<T>): SolidElement {
  const parent = useContext(CollectionContext);

  const options = {
    addIdAndValue: true,
    get children() {
      return props.children;
    },
    get dependencies() {
      return [...(parent?.dependencies ?? []), ...(props.dependencies ?? [])];
    },
    get idScope() {
      return props.idScope ?? parent?.idScope;
    },
    get items() {
      return props.items;
    },
  };

  const document = useContext(CollectionDocumentContext);

  return (
    <CollectionContext value={options}>
      {document ? (
        <CollectionRoot>
          <CollectionContent {...options} />
        </CollectionRoot>
      ) : (
        <CollectionContent {...options} />
      )}
    </CollectionContext>
  );
}

function CollectionContent<T>(props: CachedChildrenOptions<T>): SolidElement {
  const content = createCachedChildren(props);

  return <>{content()}</>;
}

function CollectionRoot(props: { children?: SolidElement }): SolidElement {
  const document = useContext(CollectionDocumentContext);

  return (
    <CollectionDocumentContext value={null}>
      <ShallowRenderContext value={true}>
        <CollectionNodeContext value={document}>
          {props.children}
        </CollectionNodeContext>
      </ShallowRenderContext>
    </CollectionDocumentContext>
  );
}
