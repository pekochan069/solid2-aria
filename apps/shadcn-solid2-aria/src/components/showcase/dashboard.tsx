/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/dashboard/page.tsx and components/{app-sidebar,chart-area-interactive,data-table,section-cards,site-header}.tsx.
 * Modified for Solid Aria: Solid 2 reactive filters, SVG area chart, responsive sidebar, local Aria controls, and native data table.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, createSignal, For } from "solid-js";
import { z } from "zod";

import { Button } from "../../registry/ui/button";
import { Input } from "../../registry/ui/input";
import { dashboardSeries } from "./chart-data";
import { DashboardIcon } from "./dashboard-icons";
import dashboardData from "./dashboard.json";
import { TimelineChart } from "./timeline-chart";

const documents = z
  .array(
    z.object({
      header: z.string(),
      id: z.number(),
      limit: z.string(),
      reviewer: z.string(),
      status: z.string(),
      target: z.string(),
      type: z.string(),
    })
  )
  .parse(dashboardData);

const metrics = [
  {
    change: "+12.5%",
    detail: "Visitors for the last 6 months",
    label: "Total Revenue",
    note: "Trending up this month",
    value: "$1,250.00",
  },
  {
    change: "-20%",
    detail: "Acquisition needs attention",
    label: "New Customers",
    note: "Down 20% this period",
    value: "1,234",
  },
  {
    change: "+12.5%",
    detail: "Engagement exceed targets",
    label: "Active Accounts",
    note: "Strong user retention",
    value: "45,678",
  },
  {
    change: "+4.5%",
    detail: "Meets growth projections",
    label: "Growth Rate",
    note: "Steady performance increase",
    value: "4.5%",
  },
];

export function Dashboard() {
  const [section, setSection] = createSignal("Documents");
  const [period, setPeriod] = createSignal("7");
  const [query, setQuery] = createSignal("");
  const [tab, setTab] = createSignal("Outline");
  const [page, setPage] = createSignal(0);

  const rows = createMemo(() =>
    documents.filter(
      (row) =>
        row.header.toLowerCase().includes(query().toLowerCase()) &&
        (tab() !== "Past Performance" || row.status === "Done") &&
        (tab() !== "Key Personnel" || row.reviewer !== "Assign reviewer")
    )
  );

  const pages = createMemo(() => Math.max(1, Math.ceil(rows().length / 8)));
  const activePage = createMemo(() => Math.min(page(), pages() - 1));

  const chartRows = createMemo(() =>
    dashboardSeries.slice(-Number(period()) - 1).map((row) => ({
      date: row.date,
      first: row.desktop,
      second: row.mobile,
    }))
  );

  return (
    <>
      <div class="dashboard-mobile-preview">
        <img
          src="/examples/dashboard-light.png"
          width="1280"
          height="843"
          alt="Dashboard"
          class="gallery-light"
        />
        <img
          src="/examples/dashboard-dark.png"
          width="1280"
          height="843"
          alt="Dashboard"
          class="gallery-dark"
        />
      </div>
      <div class="showcase-dashboard">
        <aside class="showcase-dashboard-sidebar">
          <a href="/" class="showcase-brand">
            <DashboardIcon name="brand" size={20} /> Acme Inc.
          </a>
          <nav aria-label="Dashboard navigation">
            <small>Home</small>
            <For
              each={
                [
                  { icon: "dashboard", title: "Dashboard" },
                  { icon: "lifecycle", title: "Lifecycle" },
                  { icon: "analytics", title: "Analytics" },
                  { icon: "projects", title: "Projects" },
                  { icon: "team", title: "Team" },
                ] as const
              }
            >
              {(item) => (
                <button
                  type="button"
                  data-active={section() === item.title || undefined}
                  onClick={() => {
                    setSection(item.title);
                  }}
                >
                  <DashboardIcon name={item.icon} /> {item.title}
                </button>
              )}
            </For>
            <small>Documents</small>
            <For
              each={
                [
                  { icon: "database", title: "Data Library" },
                  { icon: "reports", title: "Reports" },
                  { icon: "word", title: "Word Assistant" },
                ] as const
              }
            >
              {(item) => (
                <button
                  type="button"
                  onClick={() => {
                    setSection(item.title);
                    setQuery("");
                  }}
                >
                  <DashboardIcon name={item.icon} /> {item.title}
                </button>
              )}
            </For>
            <button
              type="button"
              onClick={() => {
                setSection("More");
              }}
            >
              <DashboardIcon name="more" /> More
            </button>
          </nav>
          <div class="showcase-sidebar-bottom">
            <a href="/docs">
              <DashboardIcon name="settings" /> Settings &amp; Help
            </a>
            <div class="showcase-user-line">
              <span class="showcase-avatar">SC</span>
              <span>
                <strong>shadcn</strong>
                <small>m@example.com</small>
              </span>
            </div>
          </div>
        </aside>
        <div class="showcase-dashboard-main">
          <header class="showcase-dashboard-header">
            <span>{section()}</span>
            <Button
              size="sm"
              onPress={() => {
                setSection("Projects");
                setQuery("");
              }}
            >
              <DashboardIcon name="plus" /> Quick Create
            </Button>
          </header>
          <div class="showcase-dashboard-content">
            <h1 class="sr-only">{section()}</h1>
            <div class="showcase-metrics">
              <For each={metrics}>
                {(metric) => (
                  <article>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <span class="showcase-badge">
                      <DashboardIcon
                        name={metric.change.startsWith("-") ? "down" : "up"}
                        size={12}
                      />{" "}
                      {metric.change}
                    </span>
                    <p>
                      {metric.note}{" "}
                      <DashboardIcon
                        name={metric.change.startsWith("-") ? "down" : "up"}
                      />
                    </p>
                    <small>{metric.detail}</small>
                  </article>
                )}
              </For>
            </div>
            <section class="showcase-panel dashboard-visitors">
              <div class="showcase-row">
                <div>
                  <h2>Total Visitors</h2>
                  <p>Total for the last 3 months</p>
                </div>
                <div class="showcase-segment" aria-label="Chart period">
                  <For
                    each={[
                      ["90", "Last 3 months"],
                      ["30", "Last 30 days"],
                      ["7", "Last 7 days"],
                    ]}
                  >
                    {(item) => (
                      <button
                        type="button"
                        aria-pressed={period() === item[0] ? "true" : "false"}
                        onClick={() => {
                          setPeriod(item[0] ?? "90");
                        }}
                      >
                        {item[1]}
                      </button>
                    )}
                  </For>
                </div>
              </div>
              <TimelineChart
                points={chartRows()}
                variant="visitors"
                label={`Visitor area chart for the last ${period()} days`}
              />
            </section>
            <div class="showcase-toolbar">
              <div class="showcase-segment">
                <For
                  each={[
                    "Outline",
                    "Past Performance",
                    "Key Personnel",
                    "Focus Documents",
                  ]}
                >
                  {(name) => (
                    <button
                      type="button"
                      aria-pressed={tab() === name ? "true" : "false"}
                      onClick={() => {
                        setTab(name);
                        setPage(0);
                      }}
                    >
                      {name}
                    </button>
                  )}
                </For>
              </div>
              <Input
                aria-label="Filter documents"
                type="search"
                placeholder="Search documents..."
                value={query()}
                onInput={(event) => {
                  setQuery(event.currentTarget.value);
                  setPage(0);
                }}
              />
            </div>
            <div class="showcase-table-wrap">
              <table class="showcase-table">
                <thead>
                  <tr>
                    <th>
                      <span class="sr-only">Select</span>
                    </th>
                    <th>Header</th>
                    <th>Section Type</th>
                    <th>Status</th>
                    <th>Target</th>
                    <th>Limit</th>
                    <th>Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  <For
                    each={rows().slice(activePage() * 8, activePage() * 8 + 8)}
                    fallback={
                      <tr>
                        <td colspan={7}>No documents found.</td>
                      </tr>
                    }
                  >
                    {(row) => (
                      <tr>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.header}`}
                          />
                        </td>
                        <td>{row.header}</td>
                        <td>
                          <span class="showcase-badge">{row.type}</span>
                        </td>
                        <td class="showcase-nowrap">
                          {row.status === "Done" ? "✓" : "◷"} {row.status}
                        </td>
                        <td>{row.target}</td>
                        <td>{row.limit}</td>
                        <td>{row.reviewer}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <div class="showcase-pagination">
              <p>{rows().length} documents</p>
              <span>
                Page {activePage() + 1} of {pages()}
              </span>
              <Button
                variant="outline"
                isDisabled={activePage() === 0}
                onPress={() => {
                  setPage(Math.max(0, activePage() - 1));
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                isDisabled={activePage() + 1 >= pages()}
                onPress={() => {
                  setPage(activePage() + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
