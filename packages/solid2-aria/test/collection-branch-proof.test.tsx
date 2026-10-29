import { test } from "bun:test";
import assert from "node:assert/strict";

import { render } from "@solidjs/web";
import { flush } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { ItemNode, SectionNode } from "../src/collections/base-collection";
import {
  CollectionBuilder,
  createBranchComponent,
  createLeafComponent,
} from "../src/collections/collection-builder";

test("collection branches retain child parent keys", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const Item = createLeafComponent(
    ItemNode,
    (_props: { id: string; children?: SolidElement }) => null
  );

  const Section = createBranchComponent(
    SectionNode,
    (_props: { id: string; children?: SolidElement }) => null
  );

  const dispose = render(
    () => (
      <CollectionBuilder
        content={
          <Section id="group">
            <Item id="one">One</Item>
          </Section>
        }
      >
        {(collection) => (
          <output>{collection.getItem("one")?.parentKey ?? "missing"}</output>
        )}
      </CollectionBuilder>
    ),
    host
  );

  flush();
  assert.equal(host.querySelector("output")?.textContent, "group");
  dispose();
  host.remove();
});
