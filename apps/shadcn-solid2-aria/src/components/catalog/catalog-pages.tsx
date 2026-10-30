/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/blocks/{layout,page,[...categories]/page}.tsx, apps/v4/app/(app)/charts/{layout,[type]/page}.tsx, and apps/v4/components/{block-display,block-viewer,blocks-nav,chart-display,chart-toolbar}.tsx.
 * Modified for Solid Aria: Solid 2 catalog navigation, responsive iframe previews, source panels, and native SVG charts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  FullscreenIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
  TabletIcon,
  ChartAreaIcon,
} from "@lucide/solid";
import { createMemo, createSignal, For, Loading, Show } from "solid-js";

import { CopyButton } from "../docs/code";
import { PageHeader, PageNav } from "../docs/page-header";
import { BlockPreview, loadBlockFiles } from "./block-preview";
import { blocks, charts, chartTypes } from "./inventory";

import "../../styles/catalog.css";

function SourceFiles(props: { name: string }) {
  const files = createMemo(async () => await loadBlockFiles(props.name));

  return (
    <div class="catalog-source">
      <For each={files()}>
        {(file) => (
          <details open>
            <summary>
              {file.name}
              <CopyButton value={file.code} />
            </summary>
            <pre>
              <code>{file.code}</code>
            </pre>
          </details>
        )}
      </For>
    </div>
  );
}

function BlockDisplay(props: { block: (typeof blocks)[number] }) {
  const [source, setSource] = createSignal(false);
  const [width, setWidth] = createSignal("100%");
  let frame: HTMLIFrameElement | undefined;

  return (
    <article class="catalog-block" id={props.block.name}>
      <header class="catalog-block-toolbar">
        <div class="catalog-view-tabs" aria-label="Block view">
          <button
            type="button"
            aria-pressed={source() ? "false" : "true"}
            onClick={() => {
              setSource(false);
            }}
          >
            Preview
          </button>
          <button
            type="button"
            aria-pressed={source() ? "true" : "false"}
            onClick={() => {
              setSource(true);
            }}
          >
            Code
          </button>
        </div>
        <span class="header-divider" />
        <a href={`#${props.block.name}`} class="catalog-block-description">
          {props.block.description.replace(/\.$/u, "")}
        </a>
        <div class="catalog-actions">
          <div class="catalog-devices" role="group" aria-label="Preview width">
            <For
              each={[
                { icon: MonitorIcon, label: "Desktop", width: "100%" },
                { icon: TabletIcon, label: "Tablet", width: "768px" },
                { icon: SmartphoneIcon, label: "Mobile", width: "390px" },
              ]}
            >
              {(device) => (
                <button
                  type="button"
                  title={device.label}
                  aria-label={device.label}
                  aria-pressed={width() === device.width ? "true" : "false"}
                  onClick={() => {
                    setWidth(device.width);
                    setSource(false);
                  }}
                >
                  <device.icon size={14} />
                </button>
              )}
            </For>
            <span class="header-divider" />
            <a
              href={`/view/aria-nova/${props.block.name}`}
              target="_blank"
              rel="noreferrer"
              title="Open in New Tab"
              aria-label={`Open ${props.block.title}`}
            >
              <FullscreenIcon size={14} />
            </a>
            <span class="header-divider" />
            <button
              type="button"
              title="Refresh Preview"
              aria-label="Refresh Preview"
              onClick={() => frame?.contentWindow?.location.reload()}
            >
              <RotateCwIcon size={14} />
            </button>
          </div>
          <a href="/create" class="catalog-customize">
            Customize
          </a>
        </div>
      </header>
      <Show
        when={source()}
        fallback={
          <div class="catalog-frame-wrap">
            <iframe
              ref={(element) => {
                frame = element;
              }}
              class="catalog-block-frame"
              loading="lazy"
              src={`/view/aria-nova/${props.block.name}`}
              title={props.block.title}
              style={{
                height: (() => {
                  if (props.block.name.startsWith("preview")) {
                    return "1100px";
                  }

                  if (
                    props.block.name.startsWith("login") ||
                    props.block.name.startsWith("signup")
                  ) {
                    return "800px";
                  }

                  return "930px";
                })(),
                width: width(),
              }}
            />
          </div>
        }
      >
        <Loading fallback={<p class="p-6">Loading source...</p>}>
          <SourceFiles name={props.block.name} />
        </Loading>
      </Show>
    </article>
  );
}

const featuredBlocks = [
  "dashboard-01",
  "sidebar-07",
  "sidebar-03",
  "login-03",
  "login-04",
];

export function BlocksPage(props: { category?: string }) {
  const matching = createMemo(() =>
    blocks
      .filter((block) => {
        const categoryMatches =
          (props.category ?? "") === ""
            ? featuredBlocks.includes(block.name)
            : (props.category ?? "")
                .split("/")
                .every((category) => block.categories.includes(category));

        return categoryMatches;
      })
      .toSorted((a, b) =>
        (props.category ?? "") === ""
          ? featuredBlocks.indexOf(a.name) - featuredBlocks.indexOf(b.name)
          : 0
      )
  );

  return (
    <main id="main-content" class="catalog-main">
      <PageHeader
        title="Building Blocks for the Web"
        description="Clean, modern building blocks. Copy and paste into your apps. Works with Solid 2 and Solid2 Aria. Open Source. Free forever."
      >
        <a href="#blocks" class="primary-link">
          Browse Blocks
        </a>
        <a href="/docs/components" class="secondary-link">
          View Components
        </a>
      </PageHeader>
      <PageNav
        id="blocks"
        label="Block categories"
        actions={
          <a href="/blocks/sidebar" class="catalog-browse-all">
            Browse all blocks
          </a>
        }
      >
        <a
          href="/blocks"
          aria-current={(props.category ?? "") === "" ? "page" : undefined}
        >
          Featured
        </a>
        <For each={["sidebar", "login", "signup"]}>
          {(category) => (
            <a
              href={`/blocks/${category}`}
              aria-current={props.category === category ? "page" : undefined}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </a>
          )}
        </For>
      </PageNav>
      <div class="catalog-blocks-content container-wrapper section-soft">
        <div class="catalog-block-list container">
          <For each={matching()} fallback={<p>No blocks match your search.</p>}>
            {(block) => <BlockDisplay block={block} />}
          </For>
          <a href="/blocks/sidebar" class="catalog-browse-more">
            Browse more blocks
          </a>
        </div>
      </div>
    </main>
  );
}

function ChartDisplay(props: { chart: (typeof charts)[number] }) {
  const [source, setSource] = createSignal(false);

  const files = createMemo(async () =>
    source()
      ? await loadBlockFiles(props.chart.name)
      : await Promise.resolve([])
  );

  return (
    <article
      class={[
        "catalog-chart",
        {
          "catalog-chart-full":
            ["area", "bar", "line"].includes(props.chart.type) &&
            props.chart.name.endsWith("interactive"),
        },
      ]}
    >
      <div class="catalog-chart-toolbar">
        <span>
          <ChartAreaIcon size={14} />
          {props.chart.type === "tooltip"
            ? "Tooltip"
            : `${props.chart.type.charAt(0).toUpperCase() + props.chart.type.slice(1)} Chart`}
        </span>
        <div class="catalog-chart-actions">
          <CopyButton
            // oxlint-disable-next-line solid/reactivity -- This API invokes the async action imperatively.
            value={async () => {
              const loadedFiles = await loadBlockFiles(props.chart.name);

              return loadedFiles[0]?.code ?? "";
            }}
          />
          <span class="header-divider" />
          <button
            type="button"
            class="catalog-chart-code"
            aria-label={`View code for ${props.chart.title}`}
            aria-expanded={source() ? "true" : "false"}
            onClick={() => {
              setSource((open) => !open);
            }}
          >
            View Code
          </button>
        </div>
      </div>
      <div class="catalog-chart-preview">
        <BlockPreview name={props.chart.name} />
      </div>
      <Show when={source()}>
        <Loading fallback={<p>Loading source...</p>}>
          <div class="catalog-chart-source">
            <For each={files()}>
              {(file) => (
                <details open>
                  <summary>
                    {file.name}
                    <CopyButton value={file.code} />
                  </summary>
                  <pre>
                    <code>{file.code}</code>
                  </pre>
                </details>
              )}
            </For>
          </div>
        </Loading>
      </Show>
    </article>
  );
}

export function ChartsPage(props: { type: string }) {
  const matching = createMemo(() =>
    charts.filter((chart) => chart.type === props.type).slice(0, 12)
  );

  return (
    <main id="main-content" class="catalog-main">
      <PageHeader
        title="Beautiful Charts & Graphs"
        description="A collection of ready-to-use chart components built with Solid 2. From basic charts to rich data displays, copy and paste into your apps."
      >
        <a href="#charts" class="primary-link">
          Browse Charts
        </a>
        <a href="/docs/components/chart" class="secondary-link">
          Documentation
        </a>
      </PageHeader>
      <PageNav id="charts" label="Chart types">
        <For each={chartTypes}>
          {(type) => (
            <a
              href={`/charts/${type}#charts`}
              aria-current={props.type === type ? "page" : undefined}
            >
              {type === "tooltip"
                ? "Tooltips"
                : `${type.charAt(0).toUpperCase() + type.slice(1)} Charts`}
            </a>
          )}
        </For>
      </PageNav>
      <div class="container-wrapper">
        <div class="catalog-charts-content container">
          <h2 class="sr-only">
            {props.type.charAt(0).toUpperCase() + props.type.slice(1)} Charts
          </h2>
          <div class="catalog-chart-grid">
            <For
              each={matching()}
              fallback={<p>No charts match your search.</p>}
            >
              {(chart) => <ChartDisplay chart={chart} />}
            </For>
            <For
              each={Array.from({ length: Math.max(0, 12 - matching().length) })}
            >
              {() => (
                <div class="catalog-chart-placeholder" aria-hidden="true" />
              )}
            </For>
          </div>
        </div>
      </div>
    </main>
  );
}
