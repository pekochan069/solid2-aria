/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/edit-article/components/editor-workspace.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  Code2Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  RedoIcon,
  StrikethroughIcon,
  TypeIcon,
  UnderlineIcon,
  UndoIcon,
} from "@lucide/solid";
import { For } from "solid-js";

import { Button } from "../../../../../registry/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "../../../../../registry/ui/button-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../registry/ui/card";
import { Checkbox } from "../../../../../registry/ui/checkbox";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "../../../../../registry/ui/dropdown-menu";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../../../../registry/ui/field";
import { Input } from "../../../../../registry/ui/input";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "../../../../../registry/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../registry/ui/select";
import { Textarea } from "../../../../../registry/ui/textarea";

interface Milestone {
  name: string;
  complete: boolean;
  note?: string;
}

const MILESTONES: Milestone[] = [
  {
    complete: true,
    name: "Outline & Commissioning",
  },
  {
    complete: true,
    name: "First Draft Submitted",
  },
  {
    complete: false,
    name: "Review & Revisions",
    note: "Waiting on editor",
  },
  {
    complete: false,
    name: "Final Copy Edit",
  },
  {
    complete: false,
    name: "Art Direction & Layout",
  },
];

const ISSUES = [
  { label: "Spring Issue 2024", value: "spring-2024" },
  { label: "Summer Issue 2024", value: "summer-2024" },
  { label: "Autumn Issue 2024", value: "autumn-2024" },
  { label: "Winter Issue 2024", value: "winter-2024" },
];

export function EditorWorkspace() {
  return (
    <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section class="border-border/70 bg-background flex flex-col border">
        <div class="flex border-b p-2">
          <ButtonGroup>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm">
                Normal Text <ChevronDownIcon data-icon="inline-end" />
              </Button>
              <DropdownMenu>
                <DropdownMenuItem>
                  <TypeIcon />
                  Normal Text
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heading1Icon />
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heading2Icon />
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heading3Icon />
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListIcon />
                  Bullet List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListOrderedIcon />
                  Numbered List
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
            <ButtonGroupSeparator class="mx-2 data-vertical:h-4 data-vertical:self-center" />
            <Button variant="ghost" size="icon-sm" aria-label="Bold">
              <BoldIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Italic">
              <ItalicIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Underline">
              <UnderlineIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Strikethrough"
              class="hidden md:flex"
            >
              <StrikethroughIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Code"
              class="hidden md:flex"
            >
              <Code2Icon />
            </Button>
            <ButtonGroupSeparator class="mx-2 hidden data-vertical:h-4 data-vertical:self-center md:flex" />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Align Left"
              class="hidden md:flex"
            >
              <AlignLeftIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Align Center"
              class="hidden md:flex"
            >
              <AlignCenterIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Align Right"
              class="hidden md:flex"
            >
              <AlignRightIcon />
            </Button>
            <ButtonGroupSeparator class="mx-2 hidden data-vertical:h-4 data-vertical:self-center md:flex" />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Link"
              class="hidden md:flex"
            >
              <LinkIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Image"
              class="hidden md:flex"
            >
              <ImageIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup class="ml-auto">
            <Button variant="ghost" size="icon-sm" aria-label="Undo">
              <UndoIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Redo">
              <RedoIcon />
            </Button>
          </ButtonGroup>
        </div>
        <div class="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-10 py-10 leading-loose md:px-14 lg:py-18">
          <h1 class="font-heading text-4xl leading-12 font-medium tracking-wide uppercase">
            The Future of Sustainable Architecture
          </h1>
          <p>
            As cities continue to expand at an unprecedented rate, the
            architectural paradigm is shifting from mere expansion to
            sustainable integration. The concrete jungles of the 20th century
            are making way for structures that breathe, adapt, and give back to
            their environments.
          </p>
          <p>
            Historically, urban development has been a zero-sum game with
            nature.
          </p>
          <h2 class="font-heading text-2xl tracking-wide uppercase">
            The Living Building Challenge
          </h2>
          <p>
            Sterling&apos;s latest project in downtown Seattle is a testament to
            this new philosophy. &quot;We are no longer designing static
            structures,&quot; Sterling explained during a recent site visit.
            &quot;We are engineering localized ecosystems.&quot;
          </p>
          <p>
            The building features a facade of responsive biomaterials that
            adjust their porosity based on humidity and temperature,
            significantly reducing the need for artificial climate control.
            Rainwater is not merely channeled away but captured, filtered
            through a series of integrated rooftop wetlands, and reused within
            the building&apos;s greywater system.
          </p>
          <p class="text-muted-foreground text-sm">
            This shift requires more than just innovative materials; it demands
            a fundamental change in how we value space. Check with engineering
            team for specific stats.
          </p>
        </div>
      </section>
      <aside class="grid grid-cols-12 gap-(--gap) xl:flex xl:flex-col">
        <Card class="col-span-full md:col-span-6 lg:col-span-4">
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Issue</FieldLabel>
                <Select defaultValue="summer-2024">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <For each={ISSUES}>
                        {(issue) => (
                          <SelectItem id={issue.value}>
                            {issue.label}
                          </SelectItem>
                        )}
                      </For>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Author</FieldLabel>
                <Input defaultValue="Elena Rostova" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card class="col-span-full md:col-span-6 lg:col-span-4">
          <CardHeader>
            <CardTitle>Publication Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Required Milestones</FieldLegend>
                <Field>
                  <For each={MILESTONES}>
                    {(milestone) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          defaultSelected={milestone.complete}
                          name={milestone.name}
                          id={milestone.name}
                        />
                        <FieldLabel for={milestone.name}>
                          {milestone.name}
                        </FieldLabel>
                      </Field>
                    )}
                  </For>
                </Field>
              </FieldSet>
              <Field>
                <FieldLabel>Add note for editor</FieldLabel>
                <Textarea placeholder="This article needs to be revised for clarity and accuracy." />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card class="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Word Count</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={70}>
              <ProgressLabel>1,402 / 2,000 words</ProgressLabel>
              <ProgressValue />
            </Progress>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
