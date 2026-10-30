/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/typography-specimen.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { Card, CardContent, CardFooter } from "../../../registry/ui/card";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../registry/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../registry/ui/select";
import { Textarea } from "../../../registry/ui/textarea";
import { FONTS, useDesignSystemSearchParams } from "../../_config";

export function TypographySpecimen() {
  const [params] = useDesignSystemSearchParams();

  const currentFont = createMemo(() =>
    FONTS.find((font) => font.value === params.font)
  );

  const currentFontHeading = createMemo(() =>
    FONTS.find((font) => font.value === params.fontHeading)
  );

  const headingLabel = createMemo(() =>
    Boolean(currentFontHeading()?.name) &&
    currentFontHeading()?.name !== currentFont()?.name
      ? currentFontHeading()?.name
      : "Inherit"
  );

  const bodyLabel = createMemo(() => currentFont()?.name ?? "Default");

  return (
    <Card>
      <CardContent class="flex flex-col gap-2">
        <div class="text-muted-foreground text-xs font-medium uppercase">
          {headingLabel()} - {bodyLabel()}
        </div>
        <p class="cn-font-heading style-sera:text-lg style-sera:font-semibold style-sera:tracking-wider style-sera:uppercase text-2xl font-medium">
          Designing with rhythm and hierarchy.
        </p>
        <p class="text-muted-foreground text-sm leading-relaxed">
          A strong body style keeps long-form content readable and balances the
          visual weight of headings.
        </p>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Thoughtful spacing and cadence help paragraphs scan quickly without
          feeling dense.
        </p>
      </CardContent>
      <CardFooter>
        <DialogTrigger>
          <Button variant="outline" class="w-full">
            Share Feedback
          </Button>
          <Dialog>
            <DialogHeader>
              <DialogTitle>Share Feedback</DialogTitle>
              <DialogDescription>
                Let us know how we can improve your experience.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <div class="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel for="feedback-name">Name</FieldLabel>
                  <Input id="feedback-name" placeholder="Your name" />
                </Field>
                <Field>
                  <FieldLabel for="feedback-email">Email</FieldLabel>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel for="feedback-category">Category</FieldLabel>
                <Select defaultValue="general">
                  <SelectTrigger id="feedback-category" class="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem id="general">General</SelectItem>
                      <SelectItem id="bug">Bug Report</SelectItem>
                      <SelectItem id="feature">Feature Request</SelectItem>
                      <SelectItem id="improvement">Improvement</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel for="feedback-message">Message</FieldLabel>
                <Textarea
                  id="feedback-message"
                  placeholder="Tell us what's on your mind..."
                  class="min-h-24 resize-none"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <Button>Submit</Button>
            </DialogFooter>
          </Dialog>
        </DialogTrigger>
      </CardFooter>
    </Card>
  );
}

export default TypographySpecimen;
