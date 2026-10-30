/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/avatar.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { createSignal, createEffect, merge, omit } from "solid-js";

import { cn } from "#lib/cn";

function Avatar(
  props: ComponentProps<"div"> & {
    size?: "default" | "sm" | "lg";
  }
) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size");

  return (
    <div
      data-slot="avatar"
      data-size={merged.size}
      class={cn(
        "group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        merged.class
      )}
      {...rest}
    />
  );
}

type ImageState = "loading" | "loaded" | "error";

function AvatarImage(props: ComponentProps<"img">) {
  const rest = omit(props, "class", "onLoad", "onError");
  const [state, setState] = createSignal<ImageState>("loading");
  createEffect(
    () => props.src,
    () => {
      setState("loading");
    }
  );

  return (
    <img
      {...rest}
      data-slot="avatar-image"
      alt={props.alt ?? ""}
      data-state={
        typeof props.src === "string" && props.src !== "" ? state() : "error"
      }
      onLoad={(event) => {
        setState("loaded");

        if (typeof props.onLoad === "function") {
          props.onLoad(event);
        }
      }}
      onError={(event) => {
        setState("error");

        if (typeof props.onError === "function") {
          props.onError(event);
        }
      }}
      class={cn(
        "peer aspect-square size-full rounded-full object-cover data-[state=error]:hidden",
        props.class
      )}
    />
  );
}

function AvatarFallback(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="avatar-fallback"
      class={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs peer-data-[state=error]:flex peer-[*]:hidden",
        props.class
      )}
      {...rest}
    />
  );
}

function AvatarBadge(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="avatar-badge"
      class={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        props.class
      )}
      {...rest}
    />
  );
}

function AvatarGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="avatar-group"
      class={cn(
        "group/avatar-group *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2",
        props.class
      )}
      {...rest}
    />
  );
}

function AvatarGroupCount(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="avatar-group-count"
      class={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        "",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
