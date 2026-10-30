/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/report-bug.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
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

export function ReportBug() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Bug</CardTitle>
        <CardDescription>Help us fix issues faster.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="bug-title">Title</FieldLabel>
            <Input
              id="bug-title"
              placeholder="Brief description of the issue"
            />
          </Field>
          <div class="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel for="bug-severity">Severity</FieldLabel>
              <Select defaultValue="medium">
                <SelectTrigger id="bug-severity" class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem id="critical">Critical</SelectItem>
                    <SelectItem id="high">High</SelectItem>
                    <SelectItem id="medium">Medium</SelectItem>
                    <SelectItem id="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel for="bug-component">Component</FieldLabel>
              <Select defaultValue="dashboard">
                <SelectTrigger id="bug-component" class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem id="dashboard">Dashboard</SelectItem>
                    <SelectItem id="auth">Auth</SelectItem>
                    <SelectItem id="api">API</SelectItem>
                    <SelectItem id="billing">Billing</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel for="bug-steps">Steps to reproduce</FieldLabel>
            <Textarea
              id="bug-steps"
              placeholder="1. Go to&#10;2. Click on&#10;3. Observe..."
              class="min-h-24 resize-none"
            />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Field
          orientation="horizontal"
          class="style-sera:justify-center justify-end"
        >
          <Button variant="outline" class="style-sera:flex-1">
            Attach File
          </Button>
          <Button class="style-sera:flex-1">Submit Bug</Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

export default ReportBug;
