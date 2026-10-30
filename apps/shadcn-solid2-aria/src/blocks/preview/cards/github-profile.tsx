/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/github-profile.tsx.
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "../../../registry/ui/native-select";
import { toast } from "../../../registry/ui/sonner";
import { Textarea } from "../../../registry/ui/textarea";

export function GithubProfile() {
  return (
    <Card class="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Form submitted successfully");
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" placeholder="Taylor" />
              <FieldDescription>
                Your name may appear around GitHub where you contribute or are
                mentioned. You can remove it at any time.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel for="email">Public Email</FieldLabel>
              <NativeSelect id="email">
                <NativeSelectOption value="taylor@example.com">
                  taylor@example.com
                </NativeSelectOption>
                <NativeSelectOption value="work@example.com">
                  work@example.com
                </NativeSelectOption>
              </NativeSelect>
              <FieldDescription>
                You can manage verified email addresses in your{" "}
                <a href="#email-settings">email settings</a>.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel for="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Tell us a little bit about yourself"
              />
              <FieldDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button form="profile" class="style-sera:w-full">
          Save Profile
        </Button>
      </CardFooter>
    </Card>
  );
}

export default GithubProfile;
