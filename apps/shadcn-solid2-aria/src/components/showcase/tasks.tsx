/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/tasks/page.tsx, components/data-table.tsx, components/data-table-toolbar.tsx, components/data-table-pagination.tsx, components/columns.tsx, and data/schema.ts.
 * Modified for Solid Aria: Solid 2 filtering, sorting, selection, pagination, and task actions instead of React TanStack Table.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CircleIcon,
  CircleOffIcon,
  EllipsisIcon,
  HelpCircleIcon,
  PlusCircleIcon,
  SlidersHorizontalIcon,
  TimerIcon,
  ChevronsUpDownIcon,
} from "@lucide/solid";
import { createMemo, createSignal, For, Show, Switch, Match } from "solid-js";
import { z } from "zod";

import { Button } from "../../registry/ui/button";
import { Checkbox } from "../../registry/ui/checkbox";
import { Input } from "../../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../registry/ui/select";
import taskData from "./tasks.json";

const taskSchema = z.object({
  id: z.string(),
  label: z.string(),
  priority: z.string(),
  status: z.string(),
  title: z.string(),
});

const initialTasks = z.array(taskSchema).parse(taskData);

function titleCase(value: string) {
  return value.replaceAll(/\b\w/gu, (letter) => letter.toUpperCase());
}

function StatusIcon(props: { status: string }) {
  return (
    <Switch fallback={<CircleIcon />}>
      <Match when={props.status === "done"}>
        <CheckCircleIcon />
      </Match>
      <Match when={props.status === "in progress"}>
        <TimerIcon />
      </Match>
      <Match when={props.status === "canceled"}>
        <CircleOffIcon />
      </Match>
      <Match when={props.status === "backlog"}>
        <HelpCircleIcon />
      </Match>
    </Switch>
  );
}

function PriorityIcon(props: { priority: string }) {
  return (
    <Switch fallback={<ArrowRightIcon />}>
      <Match when={props.priority === "high"}>
        <ArrowUpIcon />
      </Match>
      <Match when={props.priority === "low"}>
        <ArrowDownIcon />
      </Match>
    </Switch>
  );
}

export function Tasks() {
  const [tasks, setTasks] = createSignal(initialTasks);
  const [query, setQuery] = createSignal("");
  const [status, setStatus] = createSignal("");
  const [priority, setPriority] = createSignal("");
  const [ascending, setAscending] = createSignal<boolean>();
  const [page, setPage] = createSignal(0);
  const [pageSize, setPageSize] = createSignal(10);
  const [selected, setSelected] = createSignal<string[]>([]);
  const [showPriority, setShowPriority] = createSignal(true);

  const filtered = createMemo(() =>
    tasks()
      .filter(
        (task) =>
          `${task.id} ${task.title}`
            .toLowerCase()
            .includes(query().toLowerCase()) &&
          (!status() || task.status === status()) &&
          (!priority() || task.priority === priority())
      )
      .toSorted((a, b) =>
        (() => {
          if (ascending() === undefined) {
            return 0;
          }

          if (ascending() === true) {
            return a.id.localeCompare(b.id);
          }

          return b.id.localeCompare(a.id);
        })()
      )
  );

  const pageCount = createMemo(() =>
    Math.max(1, Math.ceil(filtered().length / pageSize()))
  );

  const activePage = createMemo(() => Math.min(page(), pageCount() - 1));

  const visible = createMemo(() =>
    filtered().slice(activePage() * pageSize(), (activePage() + 1) * pageSize())
  );

  function toggle(id: string) {
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  }

  return (
    <>
      <div class="showcase-mobile-preview">
        <img
          src="/examples/tasks-light.png"
          width="1280"
          height="998"
          alt="Tasks"
          class="gallery-light"
        />
        <img
          src="/examples/tasks-dark.png"
          width="1280"
          height="998"
          alt="Tasks"
          class="gallery-dark"
        />
      </div>
      <section class="showcase-screen showcase-tasks">
        <div class="showcase-row">
          <div>
            <h1>Welcome back!</h1>
            <p>Here's a list of your tasks for this month.</p>
          </div>
          <details class="showcase-user">
            <summary>SC</summary>
            <div>
              <strong>shadcn</strong>
              <p>m@example.com</p>
              <a href="/examples/authentication">Account settings</a>
            </div>
          </details>
        </div>
        <div class="showcase-toolbar">
          <Input
            type="search"
            aria-label="Filter tasks"
            placeholder="Filter tasks..."
            value={query()}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
              setPage(0);
            }}
          />
          <Select
            class="task-filter"
            aria-label="Filter by status"
            value={status() || "all"}
            onChange={(value) => {
              setStatus(value === "all" ? "" : String(value ?? ""));
              setPage(0);
            }}
          >
            <SelectTrigger>
              <PlusCircleIcon /> Status
              <Show when={status()}>
                <span>{titleCase(status())}</span>
              </Show>
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all">All statuses</SelectItem>
              <For
                each={["backlog", "todo", "in progress", "done", "canceled"]}
              >
                {(value) => (
                  <SelectItem id={value}>{titleCase(value)}</SelectItem>
                )}
              </For>
            </SelectContent>
          </Select>
          <Select
            class="task-filter"
            aria-label="Filter by priority"
            value={priority() || "all"}
            onChange={(value) => {
              setPriority(value === "all" ? "" : String(value ?? ""));
              setPage(0);
            }}
          >
            <SelectTrigger>
              <PlusCircleIcon /> Priority
              <Show when={priority()}>
                <span>{titleCase(priority())}</span>
              </Show>
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all">All priorities</SelectItem>
              <For each={["low", "medium", "high"]}>
                {(value) => (
                  <SelectItem id={value}>{titleCase(value)}</SelectItem>
                )}
              </For>
            </SelectContent>
          </Select>
          <Show when={query() || status() || priority()}>
            <Button
              variant="ghost"
              onPress={() => {
                setQuery("");
                setStatus("");
                setPriority("");
                setPage(0);
              }}
            >
              Reset
            </Button>
          </Show>
          <details class="showcase-view">
            <summary>
              <SlidersHorizontalIcon size={14} /> View
            </summary>
            <label>
              <input
                type="checkbox"
                checked={showPriority()}
                onChange={(event) => {
                  setShowPriority(event.currentTarget.checked);
                }}
              />
              Priority
            </label>
          </details>
          <Button size="sm">Add Task</Button>
        </div>
        <div class="showcase-table-wrap">
          <table class="showcase-table">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    aria-label="Select visible tasks"
                    isSelected={
                      visible().length > 0 &&
                      visible().every((task) => selected().includes(task.id))
                    }
                    onChange={(checked) => {
                      setSelected(
                        checked
                          ? [
                              ...new Set([
                                ...selected(),
                                ...visible().map((task) => task.id),
                              ]),
                            ]
                          : selected().filter(
                              (id) => !visible().some((task) => task.id === id)
                            )
                      );
                    }}
                  />
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => {
                      setAscending((value) => !(value === true));
                    }}
                  >
                    Task
                  </button>
                </th>
                <th>
                  Title <ChevronsUpDownIcon />
                </th>
                <th>
                  Status <ChevronsUpDownIcon />
                </th>
                <Show when={showPriority()}>
                  <th>
                    Priority <ChevronsUpDownIcon />
                  </th>
                </Show>
                <th>
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <For
                each={visible()}
                fallback={
                  <tr>
                    <td colspan={6}>No tasks found.</td>
                  </tr>
                }
              >
                {(task) => (
                  <tr data-selected={selected().includes(task.id) || undefined}>
                    <td>
                      <Checkbox
                        aria-label={`Select ${task.id}`}
                        isSelected={selected().includes(task.id)}
                        onChange={() => {
                          toggle(task.id);
                        }}
                      />
                    </td>
                    <td class="showcase-nowrap">{task.id}</td>
                    <td>
                      <div class="task-title">
                        <span class="showcase-badge">
                          {titleCase(task.label)}
                        </span>{" "}
                        <span>{task.title}</span>
                      </div>
                    </td>
                    <td class="showcase-nowrap">
                      <div class="task-value">
                        <StatusIcon status={task.status} />
                        {titleCase(task.status)}
                      </div>
                    </td>
                    <Show when={showPriority()}>
                      <td class="showcase-nowrap">
                        <div class="task-value">
                          <PriorityIcon priority={task.priority} />
                          {titleCase(task.priority)}
                        </div>
                      </td>
                    </Show>
                    <td>
                      <details class="showcase-row-actions">
                        <summary aria-label={`Actions for ${task.id}`}>
                          <EllipsisIcon size={16} />
                        </summary>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setTasks((items) =>
                                items.map((item) =>
                                  item.id === task.id
                                    ? {
                                        ...item,
                                        status:
                                          item.status === "done"
                                            ? "todo"
                                            : "done",
                                      }
                                    : item
                                )
                              );
                            }}
                          >
                            Toggle completed
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTasks((items) =>
                                items.filter((item) => item.id !== task.id)
                              );
                              setSelected((ids) =>
                                ids.filter((id) => id !== task.id)
                              );
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <div class="showcase-pagination">
          <p>
            {filtered().filter((task) => selected().includes(task.id)).length}{" "}
            of {filtered().length} row(s) selected.
          </p>
          <label>
            Rows per page{" "}
            <select
              value={pageSize()}
              onChange={(event) => {
                setPageSize(Number(event.currentTarget.value));
                setPage(0);
              }}
            >
              <For each={[10, 20, 30, 50]}>
                {(value) => <option value={value}>{value}</option>}
              </For>
            </select>
          </label>
          <span>
            Page {activePage() + 1} of {pageCount()}
          </span>
          <Button
            variant="outline"
            aria-label="First page"
            isDisabled={activePage() === 0}
            onPress={() => {
              setPage(0);
            }}
          >
            «
          </Button>
          <Button
            variant="outline"
            aria-label="Previous page"
            isDisabled={activePage() === 0}
            onPress={() => {
              setPage((value) => Math.max(0, value - 1));
            }}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            aria-label="Next page"
            isDisabled={activePage() >= pageCount() - 1}
            onPress={() => {
              setPage(activePage() + 1);
            }}
          >
            ›
          </Button>
          <Button
            variant="outline"
            aria-label="Last page"
            isDisabled={activePage() >= pageCount() - 1}
            onPress={() => {
              setPage(pageCount() - 1);
            }}
          >
            »
          </Button>
        </div>
      </section>
    </>
  );
}
