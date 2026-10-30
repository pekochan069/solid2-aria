/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/dashboard-01/components/data-table.tsx.
 * Modified for Solid Aria: Solid signals and native table sorting, selection, pagination, and document editing replace React Table and drag adapters.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, createSignal, For, Show } from "solid-js";
import { z } from "zod";

import { Button } from "../../../registry/ui/button";
import { Input } from "../../../registry/ui/input";

export const schema = z.object({
  header: z.string(),
  id: z.number(),
  limit: z.string(),
  reviewer: z.string(),
  status: z.string(),
  target: z.string(),
  type: z.string(),
});

type Row = z.infer<typeof schema>;

export function DataTable(props: { data: Row[] }) {
  const [query, setQuery] = createSignal("");
  const [sort, setSort] = createSignal(false);
  const [page, setPage] = createSignal(0);
  const [selected, setSelected] = createSignal<number[]>([]);
  const [edited, setEdited] = createSignal<Row>();
  const [rows, setRows] = createSignal<Row[]>(() => props.data);

  const filtered = createMemo(() =>
    rows()
      .filter((row) =>
        `${row.header} ${row.type} ${row.status}`
          .toLowerCase()
          .includes(query().toLowerCase())
      )
      .toSorted((a, b) =>
        sort() ? a.header.localeCompare(b.header) : a.id - b.id
      )
  );

  const visible = () => filtered().slice(page() * 10, page() * 10 + 10);
  let dialog: HTMLDialogElement | undefined;

  return (
    <section class="space-y-4">
      <div class="flex flex-wrap justify-between gap-3">
        <div class="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setPage(0);
            }}
          >
            Outline
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("Done");
              setPage(0);
            }}
          >
            Past Performance
          </Button>
        </div>
        <Input
          aria-label="Filter documents"
          placeholder="Filter documents..."
          class="max-w-xs"
          value={query()}
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setPage(0);
          }}
        />
      </div>
      <div class="overflow-x-auto rounded-lg border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50 text-left">
            <tr>
              <th class="p-3">
                <input
                  type="checkbox"
                  aria-label="Select all documents"
                  checked={visible().every((row) =>
                    selected().includes(row.id)
                  )}
                  onChange={(event) => {
                    setSelected(
                      event.currentTarget.checked
                        ? visible().map((row) => row.id)
                        : []
                    );
                  }}
                />
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => {
                    setSort((value) => !value);
                  }}
                >
                  Header {sort() ? "↑" : "↓"}
                </button>
              </th>
              <th>Section Type</th>
              <th>Status</th>
              <th>Target</th>
              <th>Limit</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            <For each={visible()}>
              {(row) => (
                <tr class="border-t">
                  <td class="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.header}`}
                      checked={selected().includes(row.id)}
                      onChange={(event) => {
                        setSelected((value) =>
                          event.currentTarget.checked
                            ? [...value, row.id]
                            : value.filter((id) => id !== row.id)
                        );
                      }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      class="underline-offset-4 hover:underline"
                      onClick={() => {
                        setEdited(row);
                        dialog?.showModal();
                      }}
                    >
                      {row.header}
                    </button>
                  </td>
                  <td class="p-3">{row.type}</td>
                  <td class="p-3">
                    <span class="rounded-md border px-2 py-1 text-xs">
                      {row.status}
                    </span>
                  </td>
                  <td>{row.target}</td>
                  <td>{row.limit}</td>
                  <td class="p-3">{row.reviewer}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <div class="text-muted-foreground flex justify-between gap-3 text-sm">
        <span>
          {selected().length} of {filtered().length} row(s) selected.
        </span>
        <div class="flex items-center gap-3">
          <span>
            Page {page() + 1} of{" "}
            {Math.max(1, Math.ceil(filtered().length / 10))}
          </span>
          <Button
            variant="outline"
            size="sm"
            isDisabled={page() === 0}
            onClick={() => {
              setPage((value) => value - 1);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            isDisabled={(page() + 1) * 10 >= filtered().length}
            onClick={() => {
              setPage((value) => value + 1);
            }}
          >
            Next
          </Button>
        </div>
      </div>
      <dialog
        ref={(element) => {
          dialog = element;
        }}
        class="bg-background text-foreground m-auto w-96 max-w-[90vw] rounded-xl border p-6 backdrop:bg-black/50"
      >
        <Show when={edited()}>
          {(row) => (
            <form
              class="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                const enteredHeader = fields.get("header");

                const header =
                  typeof enteredHeader === "string"
                    ? enteredHeader
                    : row().header;

                setRows((previous) =>
                  previous.map((item) =>
                    item.id === row().id ? { ...item, header } : item
                  )
                );
                dialog?.close();
              }}
            >
              <h2 class="text-lg font-semibold">Edit document</h2>
              <label class="block">
                Header
                <Input name="header" value={row().header} />
              </label>
              <p class="text-muted-foreground text-sm">
                {row().type} · {row().status}
              </p>
              <div class="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dialog?.close()}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </Show>
      </dialog>
    </section>
  );
}

export default DataTable;
