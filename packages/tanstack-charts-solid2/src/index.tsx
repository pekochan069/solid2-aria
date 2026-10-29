/**
MIT License

Copyright (c) 2026-present Tanner Linsley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/*
 * Derived from TanStack/charts (https://github.com/TanStack/charts): packages/solid-charts/src/Chart.tsx and packages/solid-charts/src/types.ts.
 * Modified for Solid Aria: Solid 2 renderer imports, compute/apply effects, reactive props, and owner-scoped mounting and disposal.
 * See NOTICE.txt at the repository root for attribution.
 */

import { Portal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type {
  ChartHostCommonOptions,
  ChartHostOptions,
  ChartTooltipBodyContext,
  ChartRenderer,
  ChartRendererHostOptions,
  ChartRendererRenderContext,
  ChartTooltipContent,
  ChartTooltipBodyTarget,
  ChartValue,
} from "@tanstack/charts";
import { createChartRendererAdapter } from "@tanstack/charts/adapter/renderer";
import { renderChartSvg } from "@tanstack/charts/svg";
import { createSvgChartRenderer } from "@tanstack/charts/svg/renderer";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onSettled,
  untrack,
} from "solid-js";

export interface ChartPresentationProps {
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
}

export interface ChartTooltipBodyRenderContext<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> extends ChartTooltipBodyContext<TDatum, TXValue, TYValue> {
  readonly defaultBody: JSX.Element;
}

export interface ChartTooltipBodyRenderProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> {
  readonly renderTooltipBody?: (
    context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>
  ) => JSX.Element;
}

export type ChartCommonProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartHostCommonOptions<TDatum, TXValue, TYValue> &
  ChartPresentationProps &
  ChartTooltipBodyRenderProps<TDatum, TXValue, TYValue>;

export type ChartProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartHostOptions<TDatum, TXValue, TYValue> &
  ChartPresentationProps &
  ChartTooltipBodyRenderProps<TDatum, TXValue, TYValue>;

export type {
  DomChartDefinition as ChartDefinition,
  ChartPoint,
} from "@tanstack/charts";

export function toHostOptions<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  props: ChartProps<TDatum, TXValue, TYValue>,
  host: {
    readonly idPrefix: string;
    readonly renderer: ChartRenderer<TDatum, TXValue, TYValue>;
    readonly onTooltipBodyChange: (
      target: ChartTooltipBodyTarget<TDatum, TXValue, TYValue> | null
    ) => void;
  }
): ChartRendererHostOptions<TDatum, TXValue, TYValue> {
  const {
    class: _class,
    style: _style,
    renderSvg: _renderSvg,
    renderTooltipBody,
    onRender,
    ...options
  } = props;

  const handleRender = onRender
    ? (context: ChartRendererRenderContext<TDatum, TXValue, TYValue>): void => {
        const element =
          context.surface.defaultElement ?? context.surface.element;

        const SvgElement =
          context.container.ownerDocument.defaultView?.SVGSVGElement;

        if (!SvgElement || !(element instanceof SvgElement)) {
          throw new TypeError("Expected the SVG chart surface.");
        }

        onRender({
          container: context.container,
          interaction: context.interaction,
          scene: context.scene,
          surface: context.surface,
          svg: element,
        });
      }
    : undefined;

  return {
    ...options,
    idPrefix: host.idPrefix,
    onRender: handleRender,
    onTooltipBodyChange: renderTooltipBody
      ? host.onTooltipBodyChange
      : undefined,
    renderer: host.renderer,
  };
}

function TooltipSwatch(props: { readonly color: string }): JSX.Element {
  return (
    <span
      class="ts-chart-tooltip__swatch"
      aria-hidden="true"
      style={{
        background: props.color,
        "border-radius": "0.15rem",
        "box-shadow": "inset 0 0 0 1px rgb(0 0 0/.12)",
        display: "block",
        height: "0.55rem",
        width: "0.55rem",
      }}
    />
  );
}

function StructuredTooltipBody(props: {
  readonly content: ChartTooltipContent;
}): JSX.Element {
  return (
    <>
      <Show when={props.content.title}>
        <div
          class="ts-chart-tooltip__title"
          style={{
            "align-items": "center",
            display: "flex",
            "font-weight": 650,
            gap: "0.4rem",
            "margin-bottom": props.content.rows.length ? "0.3rem" : 0,
          }}
        >
          <Show when={props.content.color}>
            {(color) => <TooltipSwatch color={color()} />}
          </Show>
          {props.content.title}
        </div>
      </Show>
      <Show when={props.content.rows.length}>
        <div class="ts-chart-tooltip__rows" aria-hidden="true">
          <For each={props.content.rows}>
            {(row) => (
              <div
                class="ts-chart-tooltip__row"
                data-active={String(row.active === true)}
                style={{
                  "align-items": "center",
                  background:
                    row.active === true
                      ? "var(--ts-chart-tooltip-active-row-background, color-mix(in srgb, currentColor 12%, transparent))"
                      : undefined,
                  "border-radius":
                    row.active === true
                      ? "var(--ts-chart-tooltip-active-row-border-radius, .2rem)"
                      : undefined,
                  "box-shadow":
                    row.active === true
                      ? "var(--ts-chart-tooltip-active-row-shadow, 0 0 0 2px color-mix(in srgb, currentColor 12%, transparent))"
                      : undefined,
                  "column-gap": "0.4rem",
                  display: "grid",
                  "font-weight":
                    row.active === true
                      ? "var(--ts-chart-tooltip-active-row-font-weight, 700)"
                      : undefined,
                  "grid-template-columns": "0.55rem minmax(0,1fr) auto",
                }}
              >
                <Show when={row.color} fallback={<span />}>
                  {(color) => <TooltipSwatch color={color()} />}
                </Show>
                <span>{row.label}</span>
                <span
                  style={{
                    "font-variant-numeric": "tabular-nums",
                    "text-align": "right",
                    "white-space": "nowrap",
                  }}
                >
                  {row.value}
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

function DefaultTooltipBody(props: {
  readonly content: ChartTooltipContent | string;
}): JSX.Element {
  const structuredContent = () =>
    typeof props.content === "string" ? undefined : props.content;

  return (
    <Show when={structuredContent()} fallback={props.content}>
      {(content) => <StructuredTooltipBody content={content()} />}
    </Show>
  );
}

export function TooltipBodyPortal<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(props: {
  readonly render: NonNullable<
    ChartProps<TDatum, TXValue, TYValue>["renderTooltipBody"]
  >;
  readonly target: ChartTooltipBodyTarget<TDatum, TXValue, TYValue>;
}): JSX.Element {
  const defaultBody = <DefaultTooltipBody content={props.target.content} />;

  const context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue> = {
    get content() {
      return props.target.content;
    },
    defaultBody,
    get dismiss() {
      return props.target.dismiss;
    },
    get pinned() {
      return props.target.pinned;
    },
    get points() {
      return props.target.points;
    },
    get primaryPoint() {
      return props.target.primaryPoint;
    },
  };

  const body = untrack(() => props.render(context));

  return <Portal mount={props.target.element}>{body}</Portal>;
}

export function Chart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>(props: ChartProps<TDatum, TXValue, TYValue>): JSX.Element {
  const generatedId = createUniqueId();
  const generatedPrefix = `ts-chart-${generatedId.replaceAll(/[^a-zA-Z0-9_-]/gu, "")}`;

  const renderer = createMemo(() =>
    createSvgChartRenderer<TDatum, TXValue, TYValue>(
      props.renderSvg ?? renderChartSvg
    )
  );

  const [tooltipBodyTarget, setTooltipBodyTarget] =
    createSignal<ChartTooltipBodyTarget<TDatum, TXValue, TYValue> | null>(null);

  const options = () =>
    toHostOptions(props, {
      idPrefix: props.idPrefix ?? generatedPrefix,
      onTooltipBodyChange: (target) => {
        setTooltipBodyTarget(target);
      },
      renderer: renderer(),
    });

  const adapter = untrack(() => createChartRendererAdapter(options()));
  const initialMarkup = untrack(() => adapter.prerender());
  let container: HTMLDivElement | undefined;

  createEffect(options, (nextOptions) => {
    adapter.update(nextOptions);
  });
  onSettled(() => {
    if (container) {
      adapter.mount(container);
    }

    return () => {
      adapter.destroy();
    };
  });

  const aspectRatio = () =>
    props.aspectRatio !== undefined &&
    Number.isFinite(props.aspectRatio) &&
    props.aspectRatio > 0
      ? props.aspectRatio
      : undefined;

  const height = () => {
    if (props.height !== undefined) {
      return `${props.height}px`;
    }

    return aspectRatio() === undefined ? "320px" : undefined;
  };

  return (
    <>
      <div
        class={["ts-chart-host", props.class]}
        style={{
          "aspect-ratio":
            props.height === undefined ? aspectRatio()?.toString() : undefined,
          height: height(),
          position: "relative",
          width: props.width === undefined ? "100%" : `${props.width}px`,
          ...props.style,
        }}
      >
        <div
          ref={(element) => {
            container = element;
          }}
          class="ts-chart-surface"
          style={{ height: "100%", width: "100%" }}
          // oxlint-disable-next-line solid/no-innerhtml
          innerHTML={initialMarkup}
        />
      </div>
      <Show when={props.renderTooltipBody} keyed>
        {(renderTooltipBody) => (
          <Show when={tooltipBodyTarget()}>
            {(target) => (
              <TooltipBodyPortal render={renderTooltipBody} target={target()} />
            )}
          </Show>
        )}
      </Show>
    </>
  );
}
