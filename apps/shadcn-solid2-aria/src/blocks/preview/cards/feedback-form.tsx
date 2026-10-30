/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/feedback-form.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../../../registry/ui/button";
import { Card, CardContent, CardFooter } from "../../../registry/ui/card";
import { Field, FieldGroup, FieldLabel } from "../../../registry/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "../../../registry/ui/native-select";
import { toast } from "../../../registry/ui/sonner";
import { Textarea } from "../../../registry/ui/textarea";

export function FeedbackForm() {
  return (
    <Card>
      <CardContent>
        <form
          id="feedback-form"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Form submitted successfully");
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel for="topic">Topic</FieldLabel>
              <NativeSelect id="topic">
                <NativeSelectOption value="">Select a topic</NativeSelectOption>
                <NativeSelectOption value="ai">AI</NativeSelectOption>
                <NativeSelectOption value="accounts-and-access-controls">
                  Accounts and Access Controls
                </NativeSelectOption>
                <NativeSelectOption value="billing">Billing</NativeSelectOption>
                <NativeSelectOption value="cdn">
                  CDN (Firewall, Caching)
                </NativeSelectOption>
                <NativeSelectOption value="ci-cd">
                  CI/CD (Builds, Deployments, Environment Variables)
                </NativeSelectOption>
                <NativeSelectOption value="dashboard-interface">
                  Dashboard Interface (Navigation, UI Issues)
                </NativeSelectOption>
                <NativeSelectOption value="domains">Domains</NativeSelectOption>
                <NativeSelectOption value="frameworks">
                  Frameworks
                </NativeSelectOption>
                <NativeSelectOption value="marketplace-and-integrations">
                  Marketplace and Integrations
                </NativeSelectOption>
                <NativeSelectOption value="observability">
                  Observability (Observability, Logs, Monitoring)
                </NativeSelectOption>
                <NativeSelectOption value="storage">Storage</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel for="feedback">Feedback</FieldLabel>
              <Textarea
                id="feedback"
                placeholder="Your feedback helps us improve..."
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="feedback-form" class="style-sera:w-full">
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default FeedbackForm;
